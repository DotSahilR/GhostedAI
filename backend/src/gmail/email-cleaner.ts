
const INVISIBLE_UNICODE_REGEX =
  /[\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180E\u200B\u200C\u200D\u200E\u200F\u2028\u2029\u202A\u202B\u202C\u202D\u202E\u2060\u2061\u2062\u2063\u2064\u2066\u2067\u2068\u2069\u3164\uFEFF\uFFA0]/gu;

const REPEATED_WHITESPACE_REGEX = /[ \t]{2,}/g;

const MULTIPLE_NEWLINES_REGEX = /\n{3,}/g;

const TRACKING_PARAM_REGEX = /[?&](utm_\w+|gclid|fbclid|mc_cid|mc_eid|msclkid|twclid|li_fat_id|oly_anon_id|oly_enc_id|_refitter)=[^&]*/gi;

const TRACKING_PIXEL_REGEX = /<img[^>]*(?:width=["']?1["']?|height=["']?1["']?|1x1|tracking|pixel)[^>]*>/gi;

const SCRIPT_STYLE_REGEX = /<(script|style|noscript|head)[^>]*>[\s\S]*?<\/\1>/gi;

const HTML_TAG_REGEX = /<[^>]+>/g;

const HTML_ENTITY_REGEX = /&(amp|lt|gt|quot|apos|nbsp|#\d+|#x[0-9a-fA-F]+);/g;

const HTML_ENTITY_MAP: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&nbsp;": " ",
};

const UNSUBSCRIBE_PATTERNS = [
  /unsubscribe/gi,
  /manage\s+preferences/gi,
  /email\s+preferences/gi,
  /opt\s*-?\s*out/gi,
  /stop\s+receiving/gi,
];

const TRACKING_URL_PATTERNS = [
  /https?:\/\/url\d+\.email\.[^\s)]+/gi,
  /https?:\/\/[^\s)]*trk\.[^\s)]+/gi,
  /https?:\/\/[^\s)]*click\.[^\s)]+/gi,
  /https?:\/\/[^\s)]*track\.[^\s)]+/gi,
  /https?:\/\/[^\s)]*email\.track[^\s)]*/gi,
  /https?:\/\/t\.me\/[^\s)]+/gi,
  /https?:\/\/[^\s)]*\.emlnet\.net[^\s)]*/gi,
  /https?:\/\/[^\s)]*\.market[^\s)]*\.google[^\s)]*/gi,
  /https?:\/\/[^\s)]*beehiiv\.com[^\s)]*/gi,
  /https?:\/\/[^\s)]*substack\.com[^\s)]*/gi,
  /https?:\/\/[^\s)]*list-manage\.com[^\s)]*/gi,
];

const UNSUBSCRIBE_SECTION_REGEX =
  /(?:---+\s*\n[\s\S]*?unsubscribe[\s\S]*?(?:---+|$)|\n(?:On\s+.+wrote:[\s\S]*$))/i;

export function cleanEmailText(text: string): string {
  if (!text) return "";
  let cleaned = text;
  cleaned = cleaned.replace(INVISIBLE_UNICODE_REGEX, "");
  cleaned = cleaned.replace(REPEATED_WHITESPACE_REGEX, " ");
  cleaned = cleaned.replace(MULTIPLE_NEWLINES_REGEX, "\n\n");
  cleaned = cleaned.trim();
  return cleaned;
}

export function htmlToPlainText(html: string): string {
  if (!html) return "";
  let text = html;
  text = text.replace(TRACKING_PIXEL_REGEX, "");
  text = text.replace(SCRIPT_STYLE_REGEX, "");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<\/p>/gi, "\n\n");
  text = text.replace(/<\/div>/gi, "\n");
  text = text.replace(/<\/h[1-6]>/gi, "\n\n");
  text = text.replace(/<h[1-6][^>]*>/gi, "\n");
  text = text.replace(/<\/li>/gi, "\n");
  text = text.replace(/<li[^>]*>/gi, "  - ");
  text = text.replace(/<\/tr>/gi, "\n");
  text = text.replace(/<td[^>]*>/gi, " | ");
  text = text.replace(/<hr[^>]*>/gi, "\n---\n");
  text = text.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi, (_, href, linkText) => {
    if (UNSUBSCRIBE_PATTERNS.some((p) => p.test(linkText) || p.test(href))) {
      return linkText || "";
    }
    return linkText || href;
  });
  text = text.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, linkText) => {
    const clean = linkText.replace(/<[^>]+>/g, "").trim();
    if (UNSUBSCRIBE_PATTERNS.some((p) => p.test(clean) || p.test(href))) {
      return "";
    }
    return clean || href;
  });
  text = text.replace(HTML_TAG_REGEX, "");
  text = decodeHTMLEntities(text);
  text = text.replace(TRACKING_PARAM_REGEX, "");
  for (const pattern of TRACKING_URL_PATTERNS) {
    text = text.replace(pattern, "");
  }
  text = text.replace(REPEATED_WHITESPACE_REGEX, " ");
  text = text.replace(MULTIPLE_NEWLINES_REGEX, "\n\n");
  text = text.trim();
  return text;
}

function decodeHTMLEntities(text: string): string {
  return text.replace(HTML_ENTITY_REGEX, (entity) => {
    if (HTML_ENTITY_MAP[entity]) return HTML_ENTITY_MAP[entity];
    const decMatch = entity.match(/&#(\d+);/);
    if (decMatch?.[1]) return String.fromCharCode(parseInt(decMatch[1], 10));
    const hexMatch = entity.match(/&#x([0-9a-fA-F]+);/);
    if (hexMatch?.[1]) return String.fromCharCode(parseInt(hexMatch[1], 16));
    return entity;
  });
}

export function cleanEmailBody(raw: string, mimeType?: string): string {
  if (!raw) return "";
  let text: string;
  if (mimeType === "text/html" || (mimeType?.includes("html"))) {
    text = htmlToPlainText(raw);
  } else if (mimeType === "text/plain") {
    text = raw;
  } else {
    if (raw.includes("<") && raw.includes(">") && raw.includes("</")) {
      text = htmlToPlainText(raw);
    } else {
      text = raw;
    }
  }
  text = text.replace(UNSUBSCRIBE_SECTION_REGEX, "");
  text = cleanEmailText(text);
  return text;
}
