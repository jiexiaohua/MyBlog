import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "xh_blog_session";
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function hmac(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyPassword(input: string, expected: string) {
  if (!input || !expected) {
    return false;
  }

  return safeEqual(input, expected);
}

export function createSessionToken(secret: string, issuedAt = Date.now()) {
  const payload = String(issuedAt);
  const signature = hmac(payload, secret);

  return `${payload}.${signature}`;
}

export function verifySessionToken(
  token: string | undefined,
  secret: string,
  now = Date.now(),
) {
  if (!token || !secret) {
    return false;
  }

  const [issuedAtValue, signature, extra] = token.split(".");
  if (!issuedAtValue || !signature || extra) {
    return false;
  }

  const issuedAt = Number(issuedAtValue);
  if (!Number.isFinite(issuedAt) || issuedAt > now) {
    return false;
  }

  if (now - issuedAt > SESSION_MAX_AGE_MS) {
    return false;
  }

  return safeEqual(signature, hmac(issuedAtValue, secret));
}

export function getAdminPassword() {
  return process.env.BLOG_ADMIN_PASSWORD ?? "";
}

export function getSessionSecret() {
  return process.env.BLOG_ADMIN_SESSION_SECRET ?? "";
}

export function getCookieMaxAgeSeconds() {
  return SESSION_MAX_AGE_MS / 1000;
}

export function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) {
    return true;
  }

  const host = request.headers.get("host");
  if (!host) {
    return false;
  }

  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch {
    return false;
  }
}
