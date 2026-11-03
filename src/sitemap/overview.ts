import type { SidebarItem } from "@/lib/sitemap";
import { faSquareInfo } from "@rivet-gg/icons";
import { SITE_DOCS_ROUTE_PREFIX } from "./docs-sources";
import { guidesSidebar, siteDocsSidebar } from "./products";

/**
 * The product-agnostic docs at `/docs/` ship from the Actors repo's
 * `docs/general` bundle, with their sidebar authored in
 * `docs/general/sidebar.json`. The site splits them across two tabs:
 *
 *   Overview  the docs overview (`/docs/`), which lists every guide, and the
 *             guides themselves (`/guides/<slug>/`)
 *   Platform  every other page of the bundle, at its own `/docs/<slug>` URL
 */

/** Guides each category shows before its "more" button. */
const GUIDE_GROUP_LIMIT = 12;

const SITE_DOCS_OVERVIEW_HREF = `${SITE_DOCS_ROUTE_PREFIX}/`;

export const overviewSidebar: SidebarItem[] = [
	{ title: "Overview", href: SITE_DOCS_OVERVIEW_HREF, icon: faSquareInfo },
	...guidesSidebar().map((group) => ({ ...group, limit: GUIDE_GROUP_LIMIT })),
];

/** The bundle's sidebar without the overview page, dropping groups it empties. */
export const platformSidebar: SidebarItem[] = siteDocsSidebar().flatMap((item): SidebarItem[] => {
	if (!("pages" in item)) return item.href === SITE_DOCS_OVERVIEW_HREF ? [] : [item];
	const pages = item.pages.filter(
		(page) => !("href" in page) || page.href !== SITE_DOCS_OVERVIEW_HREF,
	);
	return pages.length > 0 ? [{ ...item, pages }] : [];
});

function firstHref(items: SidebarItem[]): string | undefined {
	for (const item of items) {
		if ("href" in item && item.href && !item.external) return item.href;
		if ("pages" in item) {
			const found = firstHref(item.pages as SidebarItem[]);
			if (found) return found;
		}
	}
}

/** Where the Platform tab lands: the first page of its sidebar. */
export const PLATFORM_DOCS_HREF = firstHref(platformSidebar) ?? SITE_DOCS_OVERVIEW_HREF;
