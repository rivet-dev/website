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
	/**
	 * Bundle directory inside the product's repo, when it is not `docs/`. The
	 * product's repo root stays the snippet root, so a bundle at
	 * `secure-exec/docs` still resolves `secure-exec/examples/...` snippets.
	 */
	bundlePath?: string;
}

const PRODUCT_DOCS_SOURCES: Record<string, DocsSource> = Object.fromEntries(
	// Shared sections (Integrations) own no content bundle.
	PRODUCTS.filter((product) => !product.section).map((product) => [
		product.id,
		{
			repo: product.repo,
			localBundle: product.localBundle,
			bundlePath: product.bundlePath,
		},
	]),
);

/**
 * Website-owned documentation that sits beside, rather than inside, a product
 * vertical: the docs overview at `/docs/` and the pages under it.
 */
export const SITE_DOCS_NAMESPACE = "docs";

const SITE_DOCS_SOURCE: DocsSource = {
	repo: "rivet-website",
	localBundle: ".",
};

/** Namespaces whose content lives in this repository rather than a product bundle. */
export const SITE_DOCS_NAMESPACES: ReadonlySet<string> = new Set([
	SITE_DOCS_NAMESPACE,
]);

export const DOCS_SOURCES: Record<string, DocsSource> = {
	...PRODUCT_DOCS_SOURCES,
	[SITE_DOCS_NAMESPACE]: SITE_DOCS_SOURCE,
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
