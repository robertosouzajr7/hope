// Public URL of the site, read at runtime so the same Docker image works on
// any domain. NEXT_PUBLIC_SITE_URL is accepted for backwards compatibility.
export function siteUrl() {
  const url = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  return url ? url.replace(/\/$/, "") : null;
}
