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
	// A shared section owns a content bundle only when it declares one.
	PRODUCTS.filter((product) => !product.section || product.bundlePath).map((product) => [
		product.id,
		{
			repo: product.repo,
			localBundle: product.localBundle,
			bundlePath: product.bundlePath,
		},
	]),
);

/**
 * Product-agnostic documentation that sits beside, rather than inside, a
 * product vertical: the docs overview at `/docs/` and the pages under it.
 *
 * It ships from `rivet-dev/rivet`'s `docs/general` bundle, next to the snippets
 * and generated schemas its pages embed. Unlike a product bundle there is no
 * tab dimension here, so the bundle's content is flat: `content/<slug>.mdx`
 * links straight in as `docs/<slug>` and renders at `/docs/<slug>`.
 */
export const SITE_DOCS_NAMESPACE = "docs";

/** Where that bundle renders. Note `/docs/deploy/` is a separate section. */
export const SITE_DOCS_ROUTE_PREFIX = "/docs";

const SITE_DOCS_SOURCE: DocsSource = {
	repo: "rivet",
	bundlePath: "docs/general",
};

/**
 * The HTTP API reference at `/docs/api/`: how to drive Rivet over plain HTTP,
 * with the TypeScript equivalent beside every call. It ships from
 * `rivet-dev/rivet`'s `docs/api` bundle, where most endpoint pages are generated
 * from the OpenAPI specs (`scripts/docs/gen-api-reference.mjs`). Like the
 * general bundle it has no tab dimension, so its content is flat:
 * `content/<group>/<slug>.mdx` renders at `/docs/api/<group>/<slug>`.
 */
export const API_DOCS_NAMESPACE = "api";

/** Where the API bundle renders. Nested under `/docs/` like Deploy is. */
export const API_DOCS_ROUTE_PREFIX = "/docs/api";

const API_DOCS_SOURCE: DocsSource = {
	repo: "rivet",
	bundlePath: "docs/api",
};

/**
 * Re-roots an API bundle content id (`api`, `api/actors/create`) onto its site
 * path without the leading slash (`docs/api`, `docs/api/actors/create`), or
 * `undefined` for ids outside the bundle. The Markdown mirror, llms.txt, and the
 * metadata API derive URLs from content ids, and this bundle is the one
 * namespace that does not render at its own id.
 */
export function apiSlugForContentId(contentId: string): string | undefined {
	if (contentId === API_DOCS_NAMESPACE) return API_DOCS_ROUTE_PREFIX.slice(1);
	if (!contentId.startsWith(`${API_DOCS_NAMESPACE}/`)) return undefined;
	return `${API_DOCS_ROUTE_PREFIX.slice(1)}/${contentId.slice(API_DOCS_NAMESPACE.length + 1)}`;
}

/** Namespaces whose content lives in this repository rather than a product bundle. */
export const SITE_DOCS_NAMESPACES: ReadonlySet<string> = new Set([
	SITE_DOCS_NAMESPACE,
	API_DOCS_NAMESPACE,
]);

export const DOCS_SOURCES: Record<string, DocsSource> = {
	...PRODUCT_DOCS_SOURCES,
	[SITE_DOCS_NAMESPACE]: SITE_DOCS_SOURCE,
	[API_DOCS_NAMESPACE]: API_DOCS_SOURCE,
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
