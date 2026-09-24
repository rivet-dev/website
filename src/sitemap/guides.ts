import type { SidebarItem } from "@/lib/sitemap";

/**
 * The Guides tab (`/guides/`). Two sources feed it:
 *
 *   - The Actors bundle's `learn` section. Its content ids are
 *     `actors/learn/<slug>` and its sidebar links `/actors/learn/<slug>`; both
 *     are re-rooted here so the bundle needs no change.
 *   - Website-owned solution guides in `src/content/guides/<slug>.mdx`, listed
 *     in `SITE_GUIDES` because the Solutions menu links to them.
 *
 * Both render through `src/pages/guides/[...slug].astro`.
 */
export const GUIDES_ROUTE_PREFIX = "/guides";

/** Content-collection prefix of the Actors bundle's guides. */
export const ACTORS_LEARN_CONTENT_PREFIX = "actors/learn";

/** The bundle's own href prefix for those pages. */
const ACTORS_LEARN_HREF_PREFIX = "/actors/learn";

export interface SiteGuide {
	slug: string;
	title: string;
	/** Sidebar group. Defaults to Solutions. */
	group?: string;
}

export const SITE_GUIDES: SiteGuide[] = [
	{ slug: "coding-agents", title: "Coding Agents" },
	{ slug: "agent-app-builders", title: "Agent App Builders" },
	{ slug: "company-agents", title: "Company-Specific Agents" },
	{
		// Prose rather than a worked example, so it sits in its own group rather
		// than beside the solution guides.
		slug: "a-radically-simpler-architecture",
		title: "A Radically Simpler Architecture",
		group: "Architecture",
	},
];

export function guideHref(slug: string): string {
	return slug ? `${GUIDES_ROUTE_PREFIX}/${slug}/` : `${GUIDES_ROUTE_PREFIX}/`;
}

/**
 * Site slug (no leading slash) of an Actors `learn` content id, e.g.
 * `actors/learn/chat-room` -> `guides/chat-room`, `actors/learn` -> `guides`.
 * Undefined for ids outside that section.
 */
export function guidesSlugForContentId(contentId: string): string | undefined {
	if (contentId === ACTORS_LEARN_CONTENT_PREFIX)
		return GUIDES_ROUTE_PREFIX.slice(1);
	if (!contentId.startsWith(`${ACTORS_LEARN_CONTENT_PREFIX}/`))
		return undefined;
	return `${GUIDES_ROUTE_PREFIX.slice(1)}/${contentId.slice(ACTORS_LEARN_CONTENT_PREFIX.length + 1)}`;
}

/** Re-roots the bundle's `/actors/learn/...` hrefs onto `/guides/...`. */
export function rerootLearnHref(href: string): string {
	if (
		href === ACTORS_LEARN_HREF_PREFIX ||
		href === `${ACTORS_LEARN_HREF_PREFIX}/`
	) {
		return `${GUIDES_ROUTE_PREFIX}/`;
	}
	if (href.startsWith(`${ACTORS_LEARN_HREF_PREFIX}/`)) {
		return `${GUIDES_ROUTE_PREFIX}/${href.slice(ACTORS_LEARN_HREF_PREFIX.length + 1)}`;
	}
	return href;
}

/** The sidebar groups that list every website-owned guide, in first-seen order. */
export const SITE_GUIDES_SIDEBAR_GROUPS: SidebarItem[] = SITE_GUIDES.reduce(
	(groups: SidebarItem[], guide) => {
		const title = guide.group ?? "Solutions";
		const page = { title: guide.title, href: guideHref(guide.slug) };
		const group = groups.find((candidate) => candidate.title === title);
		if (group) group.pages.push(page);
		else groups.push({ title, pages: [page] });
		return groups;
	},
	[],
);
