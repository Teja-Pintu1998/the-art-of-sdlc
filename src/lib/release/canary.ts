// Canary release router (AOS-1.7, PRD SC-3 option A). Production sends a share of visitors to the
// new version's deployment; New Relic compares the two by release. Free alternative to paid
// traffic splitting.
//
// Configured with Production-only environment variables (change them, then redeploy production):
//   CANARY_URL      the new version's deployment, e.g. https://the-art-of-sdlc-abc123-rover19.vercel.app
//   CANARY_PERCENT  0–100. 0 (or no URL) = canary off: everyone on the current version, no cookie.
//   VERCEL_AUTOMATION_BYPASS_SECRET  lets the proxy through the canary's preview protection.

export const BUCKET_COOKIE = "aos-canary-bucket";
export const BUCKET_MAX_AGE = 60 * 60 * 24 * 30; // a visitor stays on one version for 30 days

export type CanaryConfig = { url: URL; percent: number; bypassSecret?: string };

/** Reads the canary settings; anything missing or invalid means "canary off". */
export function canaryConfig(env: Record<string, string | undefined>): CanaryConfig | null {
  const percent = Number(env.CANARY_PERCENT);
  if (!env.CANARY_URL || !Number.isInteger(percent) || percent <= 0) return null;
  let url: URL;
  try {
    url = new URL(env.CANARY_URL);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.hostname !== "localhost") return null;
  return {
    url,
    percent: Math.min(percent, 100),
    bypassSecret: env.VERCEL_AUTOMATION_BYPASS_SECRET,
  };
}

/**
 * Each visitor gets a fixed random bucket 0–99 (sticky across visits). Bucket < percent → canary.
 * Raising the percentage moves more buckets over; nobody already on the canary moves back.
 */
export function bucketOf(cookie: string | undefined, random: () => number = Math.random) {
  const n = Number(cookie);
  const valid = cookie !== undefined && cookie !== "" && Number.isInteger(n) && n >= 0 && n < 100;
  return { bucket: valid ? n : Math.floor(random() * 100), isNew: !valid };
}

export const inCanary = (bucket: number, percent: number) => bucket < percent;
