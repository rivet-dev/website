import { ownsDocsBundle, PRODUCTS } from "./product-metadata";

/**
 * The Guides tab (`/guides/`). Every product bundle may ship guides:
 *
 *   <repo>/<bundle>/content/guides/<slug>.mdx   -> /guides/<slug>/
 *   <repo>/<bundle>/sidebar.json "guides"       -> groups of the Guides sidebar
 *
 * A bundle links its guides as `/guides/<slug>`, where they render, so nothing
 * is re-rooted. The website owns only the overview (`src/content/guides/index.mdx`).
 * Guides render through `src/pages/guides/[...slug].astro`, and their
 * `<CodeSnippet>` paths resolve against the bundle's own repo.
 */
export const GUIDES_ROUTE_PREFIX = "/guides";

/** The bundle directory and `sidebar.json` key that hold a bundle's guides. */
export const GUIDES_SECTION = "guides";

/**
 * Bundles that may ship guides, in the order the Guides sidebar merges them.
 * Shared bundles (`bundleOf`) are read once, through their source product.
 */
export const GUIDE_BUNDLES: string[] = PRODUCTS.filter(
	(product) => ownsDocsBundle(product) && !product.bundleOf && !product.unlaunched,
).map((product) => product.id);

export function guideHref(slug: string): string {
	return slug ? `${GUIDES_ROUTE_PREFIX}/${slug}/` : `${GUIDES_ROUTE_PREFIX}/`;
}

/**
 * The bundle and guide slug of a docs content id, e.g.
 * `agents/guides/sign-in-with-chatgpt` -> `{ bundle: "agents", slug: "sign-in-with-chatgpt" }`.
 * Undefined for ids outside a bundle's guides, and for a bundle's own
 * `guides/index.mdx`, which the website overview replaces.
 */
export function guideForContentId(
	contentId: string,
): { bundle: string; slug: string } | undefined {
	for (const bundle of GUIDE_BUNDLES) {
		const prefix = `${bundle}/${GUIDES_SECTION}/`;
		if (!contentId.startsWith(prefix)) continue;
		const slug = contentId.slice(prefix.length).replace(/\/index$/, "");
		return slug && slug !== "index" ? { bundle, slug } : undefined;
	}
	return undefined;
}

/**
 * Site slug (no leading slash) of a guide's content id, e.g.
 * `actors/guides/chat-room` -> `guides/chat-room`. Undefined for other ids.
 */
export function guidesSlugForContentId(contentId: string): string | undefined {
	const guide = guideForContentId(contentId);
	return guide && `${GUIDES_ROUTE_PREFIX.slice(1)}/${guide.slug}`;
}

/** Whether a docs content id sits in a bundle's guides section. */
export function isGuidesContentId(contentId: string): boolean {
	return GUIDE_BUNDLES.some(
		(bundle) =>
			contentId === `${bundle}/${GUIDES_SECTION}` ||
			contentId.startsWith(`${bundle}/${GUIDES_SECTION}/`),
	);
}
