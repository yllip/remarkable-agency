/** Site name. Appended to every page title and used as `og:site_name`. */
export const SITE_NAME = "Remarkable";
/** Fallback meta description for pages that don't set their own. */
export const SITE_DESCRIPTION =
  "Remarkable Studio is a creative agency helping authentic brands create connections through human-centric strategy, design and development.";
/** Canonical origin. Resolves canonical URLs, social images, and the sitemap. */
export const SITE_URL = "https://remarkable-agency.vercel.app";
/** Social profiles listed in the footer. */
export const SITE_SOCIALS: { label: string; href: string }[] = [
  { label: "Instagram", href: "https://instagram.com/" },
  { label: "YouTube", href: "https://youtube.com/" },
  { label: "LinkedIn", href: "https://linkedin.com/" },
];
/** BCP 47 locale tag used to format dates and numbers. */
export const SITE_LOCALE = "en-US";
/**
 * Routes kept out of search results. Each is excluded from the sitemap and
 * served with a `robots: noindex, nofollow` tag, so the two can't disagree.
 *
 * Surrounding slashes are optional: `"/thanks"`, `"thanks"` and `"/thanks/"`
 * all match the same route.
 */
export const NOINDEX_ROUTES: string[] = ["/404"];
