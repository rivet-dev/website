// Shared geometry for every non-doc site surface. Keep these classes scoped to
// the site layouts so Documentation, Learn, Integrations, and Self-Host retain
// their existing density and chrome.

export const SITE_PAGE_CLASS =
	'paper-grain selection-paper min-h-screen overflow-x-clip bg-paper font-sans text-[15px] leading-relaxed text-ink-soft';

export const SITE_GUTTER_CLASS =
	'px-4 md:px-12 min-[1681px]:px-14';

export const SITE_WIDE_RAIL_CLASS =
	'mx-auto w-full max-w-[1800px]';
export const SITE_WIDE_GUTTERED_RAIL_CLASS =
	`${SITE_WIDE_RAIL_CLASS} ${SITE_GUTTER_CLASS}`;
export const SITE_STANDARD_RAIL_CLASS =
	'mx-auto w-full max-w-7xl';
export const SITE_NARROW_RAIL_CLASS =
	'mx-auto w-full max-w-3xl';
export const SITE_EDITORIAL_RAIL_CLASS =
	'mx-auto w-full max-w-[50rem]';

export const SITE_SECTION_CLASS =
	'px-4 py-16 md:px-12 md:py-28 min-[1681px]:px-14';
export const SITE_COMPACT_SECTION_CLASS =
	'px-4 py-12 md:px-12 md:py-20 min-[1681px]:px-14';

export const SITE_UTILITY_HERO_CLASS =
	'depth-wash relative overflow-hidden bg-paper px-4 pb-16 pt-32 md:px-12 md:pb-24 md:pt-40 min-[1681px]:px-14';

export const SITE_CARD_CLASS =
	'rounded-xl border border-ink/10 bg-white/55 p-6 md:p-8';
export const SITE_WIDE_CALLOUT_CLASS =
	'rounded-2xl border border-ink/10 bg-white/55 p-6 md:p-8';
