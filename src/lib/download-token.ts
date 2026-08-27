import { createHmac, timingSafeEqual } from "node:crypto";
import type { DownloadTokenPayload } from "@/types";

const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function secret(): string {
  const s = process.env.DOWNLOAD_SIGNING_SECRET;
  if (!s) throw new Error("DOWNLOAD_SIGNING_SECRET is not set");
  return s;
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(payloadB64: string): string {
  return createHmac("sha256", secret()).update(payloadB64).digest("base64url");
}

/**
 * Signed, time-limited download token. Not a JWT on purpose — this only
 * ever needs one algorithm and no header, so a minimal HMAC-over-base64
 * payload avoids pulling in a JWT library for a single use case.
 */
export function createDownloadToken(
  payload: Omit<DownloadTokenPayload, "expiresAt">,
  ttlMs: number = DEFAULT_TTL_MS
): string {
  const full: DownloadTokenPayload = { ...payload, expiresAt: Date.now() + ttlMs };
  const payloadB64 = base64UrlEncode(JSON.stringify(full));
  const signature = sign(payloadB64);
  return `${payloadB64}.${signature}`;
}

export function verifyDownloadToken(token: string): DownloadTokenPayload | null {
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  const expectedSignature = sign(payloadB64);
  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(payloadB64)) as DownloadTokenPayload;
    if (Date.now() > payload.expiresAt) return null;
    return payload;
  } catch {
    return null;
  }
}
