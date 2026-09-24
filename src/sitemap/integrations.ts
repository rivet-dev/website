/**
 * The Integrations section (`/integrations/`): third-party frameworks and SDKs
 * backed by Rivet Actors. Its pages are authored in the Actors bundle under
 * `actors/integrations/<slug>` and re-rooted here, the same way the bundle's
 * `learn` section renders as `/guides/`. Standalone subsites (agentOS) keep
 * their own `/<product>/integrations/` tab.
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
 * root; any other product keeps them under its own vertical.
 */
export function integrationsHref(productId: string, slug = ""): string {
	const base =
		productId === SITE_INTEGRATIONS_PRODUCT
			? INTEGRATIONS_ROUTE_PREFIX
			: `/${productId}/integrations`;
	return slug ? `${base}/${slug}/` : `${base}/`;
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
