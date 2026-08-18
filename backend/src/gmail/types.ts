export interface GmailProfile {
  email: string;
  name: string;
  userId: string;
}

export interface GmailThread {
  id: string;
  subject: string;
  snippet: string;
  from: string;
  to: string;
  date: string;
  labels: string[];
  isUnread: boolean;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  labels: string[];
}

export interface GmailTokenData {
  accessToken: string;
  refreshToken: string;
  expiryDate: number;
}
