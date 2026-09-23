import path from "node:path";
import { fileURLToPath } from "node:url";

import { deploySlugForContentId } from "../sitemap/deploy";
import { guidesSlugForContentId } from "../sitemap/guides";
import { integrationsSlugForContentId } from "../sitemap/integrations";
import { PRODUCTS } from "../sitemap/product-metadata";

export const SITE_BASE_URL = "https://rivet.dev";
export const PROJECT_ROOT = fileURLToPath(new URL("../..", import.meta.url));

// Docs slugs are product-scoped (`actors/docs/state`, `agentos/tutorials`),
// so the collection slug is already the site path. The exceptions are the
// Rivet Cloud bundle, which renders inside the Deploy section, and the Actors
// `learn` and `integrations` sections, which render as the site's Guides and
// Integrations sections.
export function getDocsPath(slug: string) {
	const rerooted =
		deploySlugForContentId(slug) ??
		guidesSlugForContentId(slug) ??
		integrationsSlugForContentId(slug);
	if (rerooted) return `/${rerooted}`;

	return slug ? `/${slug}` : "/actors/docs";
}

// Bundle sections that sit in the collection but render no page:
// - a product whose Documentation tab points at another product's routes
//   (`docsHome`, e.g. a product serving a shared bundle) keeps any
//   `<product>/docs/**` content, but nothing renders there;
// - a product with a restricted `tabs` list may carry other sections in its
//   bundle (e.g. `integrations` and `use-cases`) that never route.
const UNROUTED_DOCS_PREFIXES = PRODUCTS.flatMap((product) => [
	...(product.docsHome ? [`${product.id}/docs`] : []),
	...(product.tabs
		? (["docs", "integrations", "use-cases"] as const)
				.filter((tab) => !product.tabs?.includes(tab))
				.map((tab) => `${product.id}/${tab}`)
		: []),
]);

/**
 * Whether a docs collection id (`agentos/docs/quickstart`) renders a page at
 * `getDocsPath`. False for bundle sections that only render under another
 * product, so llms.txt, the metadata API, the Markdown mirror, and the search
 * index do not publish URLs that redirect or 404.
 */
export function isRoutedDocsContentId(contentId: string) {
	const slug = normalizeSlug(contentId);
	return !UNROUTED_DOCS_PREFIXES.some(
		(prefix) => slug === prefix || slug.startsWith(`${prefix}/`),
	);
}

export function normalizeSlug(rawSlug: string) {
	let slug = rawSlug.replace(/\\/g, "/");
	if (slug === "index") return "";
	if (slug.endsWith("/index")) {
		slug = slug.slice(0, -"/index".length);
	}
	return slug;
}

export function resolveContentFile(filePath?: string) {
	if (!filePath) return null;
	return path.resolve(PROJECT_ROOT, filePath);
}
