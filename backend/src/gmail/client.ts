import { google } from "googleapis";
import { env } from "../config/env.js";
import { AppError } from "../errors/index.js";
import type { GmailProfile, GmailThread, GmailMessage, GmailTokenData } from "./types.js";
import { cleanEmailBody } from "./email-cleaner.js";

function getOAuth2Client() {
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GMAIL_CALLBACK_URL,
  );
}

export function buildGmailAuthUrl(state: string): string {
  const oauth2Client = getOAuth2Client();
  const scopes = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ];
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    state,
    prompt: "consent",
  });
}

export async function exchangeGmailCode(code: string): Promise<GmailTokenData> {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return {
    accessToken: tokens.access_token || "",
    refreshToken: tokens.refresh_token || "",
    expiryDate: tokens.expiry_date || Date.now(),
  };
}

export async function getGmailClient(accessToken: string, refreshToken?: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return google.gmail({ version: "v1", auth: oauth2Client });
}

export async function getGmailProfile(accessToken: string, refreshToken?: string): Promise<GmailProfile> {
  const gmail = await getGmailClient(accessToken, refreshToken);
  const res = await gmail.users.getProfile({ userId: "me" });
  return {
    email: res.data.emailAddress || "",
    name: res.data.emailAddress || "",
    userId: "me",
  };
}

const AUTOMATED_SENDER_PATTERNS = [
  "noreply",
  "no-reply",
  "no_reply",
  "donotreply",
  "do-not-reply",
  "notifications",
  "notification",
  "alerts",
  "newsletter",
  "marketing",
  "updates",
  "digest",
  "mailer-daemon",
  "postmaster",
  "support",
  "hello",
  "team@",
  "info@",
  "admin@",
  "system@",
  "automated",
  "bounce",
];

const AUTOMATED_DOMAINS = [
  "google.com",
  "gmail.com",
  "discord.com",
  "mailchimp.com",
  "sendgrid.net",
  "amazonses.com",
  "mailgun.org",
  "postmarkapp.com",
  "sparkpost.com",
];

function isAutomatedSender(email: string): boolean {
  const lower = email.toLowerCase();
  for (const pattern of AUTOMATED_SENDER_PATTERNS) {
    if (lower.includes(pattern)) return true;
  }
  const domain = lower.split("@")[1] || "";
  for (const autoDomain of AUTOMATED_DOMAINS) {
    if (domain === autoDomain || domain.endsWith("." + autoDomain)) return true;
  }
  return false;
}

const AUTOMATED_SUBJECT_PATTERNS = [
  "verify your",
  "verify email",
  "confirm your",
  "welcome to",
  "you signed up",
  "you shared some",
  "you missed",
  "terms of service",
  "terms & privacy",
  "privacy policy",
  "immediate action required",
];

function isAutomatedSubject(subject: string): boolean {
  const lower = subject.toLowerCase();
  for (const pattern of AUTOMATED_SUBJECT_PATTERNS) {
    if (lower.includes(pattern)) return true;
  }
  return false;
}

export async function listGmailThreads(
  accessToken: string,
  refreshToken?: string,
  maxResults = 50,
  query = "newer_than:90d",
  userEmail?: string,
): Promise<GmailThread[]> {
  const gmail = await getGmailClient(accessToken, refreshToken);
  const listRes = await gmail.users.threads.list({
    userId: "me",
    maxResults,
    q: query,
  });
  const threads = listRes.data.threads || [];
  const lowerEmail = userEmail?.toLowerCase() || "";
  const result: GmailThread[] = [];
  for (const thread of threads) {
    if (!thread.id) continue;
    const detail = await gmail.users.threads.get({
      userId: "me",
      id: thread.id,
      format: "metadata",
      metadataHeaders: ["From", "To", "Subject", "Date"],
    });
    const msgs = detail.data.messages || [];
    if (msgs.length === 0) continue;

    const lastMsg = msgs[msgs.length - 1]!;
    const headers = lastMsg.payload?.headers || [];
    const from = headers.find((h) => h.name === "From")?.value || "";
    const to = headers.find((h) => h.name === "To")?.value || "";
    const subject = headers.find((h) => h.name === "Subject")?.value || "(no subject)";
    const date = headers.find((h) => h.name === "Date")?.value || "";

    const firstMsg = msgs[0]!;
    const firstHeaders = firstMsg.payload?.headers || [];
    const originalFrom = firstHeaders.find((h) => h.name === "From")?.value || from;

    const lastFromLower = from.toLowerCase();
    const isReceived = lowerEmail && !lastFromLower.includes(lowerEmail);

    const contactEmail = isReceived
      ? (from || originalFrom)
      : (to || originalFrom);

    if (isAutomatedSender(contactEmail)) continue;
    if (isAutomatedSubject(subject)) continue;

    result.push({
      id: thread.id,
      subject,
      snippet: thread.snippet || "",
      from: originalFrom,
      to,
      date,
      labels: [],
      isUnread: false,
    });
  }
  return result;
}

export async function getGmailThreadMessages(
  threadId: string,
  accessToken: string,
  refreshToken?: string,
): Promise<GmailMessage[]> {
  const gmail = await getGmailClient(accessToken, refreshToken);
  const { data } = await gmail.users.threads.get({
    userId: "me",
    id: threadId,
    format: "full",
  });
  const messages = data.messages || [];
  return messages.map((msg) => {
    const headers = msg.payload?.headers || [];
    const from = headers.find((h) => h.name === "From")?.value || "";
    const to = headers.find((h) => h.name === "To")?.value || "";
    const subject = headers.find((h) => h.name === "Subject")?.value || "(no subject)";
    const date = headers.find((h) => h.name === "Date")?.value || "";
    const body = extractBodyFromPayload(msg.payload);
    return {
      id: msg.id || "",
      threadId: msg.threadId || threadId,
      from,
      to,
      subject,
      body,
      date,
      labels: [],
    };
  });
}

function extractBodyFromPayload(payload: any): string {
  if (!payload) return "";
  if (payload.body?.data) {
    const raw = Buffer.from(payload.body.data, "base64url").toString("utf-8");
    const mimeType = payload.mimeType || "";
    return cleanEmailBody(raw, mimeType);
  }
  if (payload.parts) {
    const plainPart = payload.parts.find(
      (p: any) => p.mimeType === "text/plain" && p.body?.data,
    );
    if (plainPart) {
      const raw = Buffer.from(plainPart.body.data, "base64url").toString("utf-8");
      return cleanEmailBody(raw, "text/plain");
    }
    const htmlPart = payload.parts.find(
      (p: any) => p.mimeType === "text/html" && p.body?.data,
    );
    if (htmlPart) {
      const raw = Buffer.from(htmlPart.body.data, "base64url").toString("utf-8");
      return cleanEmailBody(raw, "text/html");
    }
    for (const part of payload.parts) {
      if (part.parts) {
        const nested = extractBodyFromPayload(part);
        if (nested) return nested;
      }
    }
  }
  return "";
}

export async function didUserSendLastMessage(
  threadId: string,
  accessToken: string,
  refreshToken?: string,
  userEmail?: string,
): Promise<boolean> {
  const gmail = await getGmailClient(accessToken, refreshToken);
  const { data } = await gmail.users.threads.get({
    userId: "me",
    id: threadId,
    format: "metadata",
    metadataHeaders: ["From"],
  });
  const msgs = data.messages || [];
  if (msgs.length === 0) return false;
  const lastMsg = msgs[msgs.length - 1]!;
  const headers = lastMsg.payload?.headers || [];
  const lastFrom = headers.find((h) => h.name === "From")?.value || "";
  if (userEmail && lastFrom.toLowerCase().includes(userEmail.toLowerCase())) {
    return true;
  }
  return false;
}

export async function sendGmailMessage(
  accessToken: string,
  refreshToken: string | undefined,
  input: { to: string; subject: string; body: string; threadId?: string },
): Promise<{ id: string; threadId: string }> {
  const gmail = await getGmailClient(accessToken, refreshToken);
  const raw = [
    `To: ${input.to}`,
    `Subject: ${input.subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    input.body,
  ].join("\r\n");
  const sendParams = {
    userId: "me" as const,
    requestBody: {
      raw: Buffer.from(raw).toString("base64url"),
      threadId: input.threadId,
    },
  };
  const { data } = await gmail.users.messages.send(sendParams);
  return { id: data.id || "", threadId: data.threadId || input.threadId || "" };
}
