/**
 * The canonical origin, used for absolute share URLs.
 *
 * Open Graph tags must be absolute, so this has to resolve at build and at
 * request time on Vercel without anyone remembering to set it — hence the
 * fallback chain rather than a required variable.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}
