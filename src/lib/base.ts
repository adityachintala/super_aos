// URL prefix for internal links, taken from astro.config.mjs `base` with the
// trailing slash removed (e.g. "/super_aos"). Use it in every hardcoded href.
export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
