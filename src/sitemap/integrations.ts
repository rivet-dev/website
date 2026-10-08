/**
 * The Integrations section (`/integrations/`): third-party frameworks and SDKs
 * backed by Rivet Actors. Its pages are authored in the Actors bundle under
 * `actors/integrations/<slug>` and re-rooted here. Any other product (agentOS) renders
 * its integrations inside its Documentation tab at
 * `/<product>/docs/integrations/`, reached from a fold in the docs sidebar.
 *
 * Rendered by `src/pages/integrations/[...slug].astro`.
 */
export const INTEGRATIONS_ROUTE_PREFIX = "/integrations";

/**
 * The product vertical whose Integrations tab is this section. Also the key its
 * cards and sidebar are listed under in `src/data/integrations.ts`.
 */
export const SITE_INTEGRATIONS_PRODUCT = "actors";

/**
 * The bundle the pages are authored in. Integrations owns its own bundle in the
 * `rivet-dev/rivet` (`docs/integrations`) rather than riding inside the Actors
 * bundle, because it renders at the site root and covers more than one product.
 */
export const SITE_INTEGRATIONS_BUNDLE = "integrations";

/** Content-collection prefix of those pages. */
export const SITE_INTEGRATIONS_CONTENT_PREFIX = `${SITE_INTEGRATIONS_BUNDLE}/docs`;

/**
 * Href of a product's integrations page. The site product's pages sit at the
 * root; any other product keeps them inside its own docs.
 */
export function integrationsHref(productId: string, slug = ""): string {
	const base =
		productId === SITE_INTEGRATIONS_PRODUCT
			? INTEGRATIONS_ROUTE_PREFIX
			: `/${productId}/docs/${PRODUCT_INTEGRATIONS_SEGMENT}`;
	return slug ? `${base}/${slug}/` : `${base}/`;
}

/**
 * Path segment of a non-site product's integrations, both in its bundle
 * (`<product>/integrations/**`) and under its docs route
 * (`/<product>/docs/integrations/**`).
 */
export const PRODUCT_INTEGRATIONS_SEGMENT = "integrations";

/**
 * Site slug (no leading slash) of a non-site product's integrations content
 * id, e.g. `agentos/integrations/flue` -> `agentos/docs/integrations/flue`.
 * Undefined for any other id, including the site product's.
 */
export function productIntegrationsSlugForContentId(
	contentId: string,
): string | undefined {
	const [productId, segment, ...rest] = contentId.split("/");
	if (!productId || segment !== PRODUCT_INTEGRATIONS_SEGMENT) return undefined;
	if (productId === SITE_INTEGRATIONS_PRODUCT) return undefined;
	return [productId, "docs", PRODUCT_INTEGRATIONS_SEGMENT, ...rest].join("/");
}

/**
 * Site slug (no leading slash) of a site-integrations content id, e.g.
 * `actors/integrations/flue` -> `integrations/flue`, `actors/integrations` ->
 * `integrations`. Undefined for ids outside that section.
 */
export function integrationsSlugForContentId(
	contentId: string,
): string | undefined {
	if (contentId === SITE_INTEGRATIONS_CONTENT_PREFIX)
		return INTEGRATIONS_ROUTE_PREFIX.slice(1);
	if (!contentId.startsWith(`${SITE_INTEGRATIONS_CONTENT_PREFIX}/`))
		return undefined;
	return `${INTEGRATIONS_ROUTE_PREFIX.slice(1)}/${contentId.slice(SITE_INTEGRATIONS_CONTENT_PREFIX.length + 1)}`;
}

/** Re-roots the bundle's `/actors/integrations/...` hrefs onto `/integrations/...`. */
export function rerootIntegrationsHref(href: string): string {
	const from = `/${SITE_INTEGRATIONS_CONTENT_PREFIX}`;
	if (href === from || href === `${from}/`) return `${INTEGRATIONS_ROUTE_PREFIX}/`;
	if (href.startsWith(`${from}/`)) {
		return `${INTEGRATIONS_ROUTE_PREFIX}/${href.slice(from.length + 1)}`;
	}
	return href;
}
