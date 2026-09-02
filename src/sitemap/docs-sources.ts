/**
 * Which repository owns each docs namespace.
 *
 * Product docs are not authored in this repo. Each product repo ships a bundle:
 *
 *   <repo>/docs/sidebar.json
 *   <repo>/docs/content/docs/**.mdx        -> /{product}/docs/...
 *   <repo>/docs/content/tutorials/**.mdx   -> /{product}/tutorials/...
 *   <repo>/examples/**                     snippet targets, resolved from the repo root
 *
 * `scripts/assemble.mjs` symlinks `<repo>/docs/content` into
 * `src/content/docs/<product>`, and the snippet resolver reads examples straight
 * from the repo root.
 *
 * This module is pure data so it can be imported from anywhere, including the
 * browser. The filesystem side lives in `./docs-sources.node.ts`.
 *
 * Note `actors` -> `rivet`: the Actors product lives in the main Rivet repo, so
 * the mapping cannot be derived from the product id.
 */
import { PRODUCTS } from "./product-metadata";

export interface DocsSource {
	/** Repository (and sibling directory) name. */
	repo: string;
	/**
	 * Bundle path inside this repo, for products with no sibling repository.
	 * Takes precedence over `repo`.
	 */
	localBundle?: string;
}

const PRODUCT_DOCS_SOURCES: Record<string, DocsSource> = Object.fromEntries(
	PRODUCTS.map((product) => [
		product.id,
		{
			repo: product.repo,
			localBundle: product.localBundle,
		},
	]),
);

/** Website-owned documentation that sits beside, rather than inside, a product vertical. */
export const SITE_DOCS_NAMESPACE = "docs";

export const DOCS_SOURCES: Record<string, DocsSource> = {
	...PRODUCT_DOCS_SOURCES,
	[SITE_DOCS_NAMESPACE]: {
		repo: "rivet-website",
		localBundle: ".",
	},
};

export const DOCS_PRODUCT_IDS = Object.keys(DOCS_SOURCES);

/**
 * The docs namespace that owns a path, derived from where its content sits.
 *
 * Accepts either a site path (`/agentos/docs/fs`) or a content-file path
 * (`.../src/content/docs/agentos/fs.mdx`). Returns undefined for anything
 * outside the docs collection, such as the shared self-host guides.
 */
export function productFromPath(pathname: string): string | undefined {
	const normalized = pathname.replace(/\\/g, "/");

	const contentMatch = normalized.match(/src\/content\/docs\/([^/]+)\//);
	if (contentMatch && DOCS_SOURCES[contentMatch[1]]) return contentMatch[1];

	const siteMatch = normalized.match(/^\/([^/]+)(?:\/|$)/);
	if (siteMatch && DOCS_SOURCES[siteMatch[1]]) return siteMatch[1];

	return undefined;
}

/**
 * Shared self-host guides live in this repo, not in a product bundle, but their
 * snippets come from the Rivet repo's `self-host/` tree. Anything under
 * `src/content/self-host/` resolves against this product's root.
 */
export const SHARED_CONTENT_PRODUCT = "actors";
