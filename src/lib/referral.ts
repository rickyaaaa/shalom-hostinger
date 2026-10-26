// Referral attribution: the browser only keeps WordPress's signed click token. WordPress decides
// validity, lifetime and partner at order time; these checks just keep junk out of the cookie.
export const REFERRAL_COOKIE = "shalom_referral";
export const REFERRAL_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isReferralSlug(value: string) {
  return value.length >= 2 && value.length <= 40 && REFERRAL_SLUG.test(value);
}

export function isReferralToken(value: string | undefined): value is string {
  return typeof value === "string" && value.length <= 512 && /^[A-Za-z0-9_-]+\.[a-f0-9]{64}$/.test(value);
}

/** Public referral link for a partner, on the current site origin: /<slug> at the root. */
export function referralUrl(origin: string, slug: string) {
  return `${origin.replace(/\/$/, "")}/${slug}`;
}

/** Where a link to `raw` continues: the partner's own root path, or Home for anything that is not a slug. Never off-site. */
export function referralPath(raw: string) {
  const slug = raw.trim().toLowerCase();
  return isReferralSlug(slug) ? `/${slug}` : "/";
}

/** The one place a click becomes attribution (sets the cookie, then continues to Home). */
export function referralAttributionPath(slug: string) {
  return `/api/referral/${slug}`;
}
