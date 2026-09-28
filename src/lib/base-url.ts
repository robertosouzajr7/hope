import "server-only";
import { headers } from "next/headers";
import { siteUrl } from "./site-url";

export async function getBaseUrl() {
  const configured = siteUrl();
  if (configured) return configured;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
