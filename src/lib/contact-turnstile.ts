import "server-only";

import { isIP } from "node:net";
import { turnstileConfig } from "@/content/contact";

type VerificationResult = "verified" | "invalid" | "unavailable";

export async function verifyContactTurnstile(token: string, ip: string): Promise<VerificationResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  const hostnames = process.env.TURNSTILE_ALLOWED_HOSTNAMES?.split(",")
    .map((hostname) => hostname.trim().toLowerCase())
    .filter(Boolean);

  if (!secret || !hostnames?.length) {
    console.error("Contact Turnstile runtime configuration is incomplete.");
    return "unavailable";
  }
  if (!token || token.length > 2048) return "invalid";

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (isIP(ip)) body.set("remoteip", ip);

    const response = await fetch(turnstileConfig.verificationUrl, {
      method: "POST",
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return "unavailable";

    const result: unknown = await response.json();
    if (
      typeof result !== "object" || result === null ||
      !("success" in result) || result.success !== true ||
      !("action" in result) || result.action !== turnstileConfig.action ||
      !("hostname" in result) || typeof result.hostname !== "string" ||
      !hostnames.includes(result.hostname.toLowerCase())
    ) {
      return "invalid";
    }
    return "verified";
  } catch {
    console.error("Contact Turnstile verification could not be completed.");
    return "unavailable";
  }
}
