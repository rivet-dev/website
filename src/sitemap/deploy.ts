/**
 * The Deploy section: where the control plane runs. Everything sits under one
 * prefix, whatever bundle the page comes from:
 *
 *   src/content/self-host/index    ->  /docs/deploy/  (the section overview)
 *   src/content/self-host/<page>  ->  /docs/deploy/self-host/<page>/
 *   cloud/docs/content/docs/<page> ->  /docs/deploy/cloud/<page>/
 *   cloud/docs/content/byoc/<page> ->  /docs/deploy/byoc/<page>/
 *
 * The self-host guides are website-owned and generated from `deployMatrix`;
 * the two managed options ship in the Rivet Cloud bundle (`cloud/docs/`).
 * Every consumer of these mappings (the routes, the Markdown mirror, the
 * search index, redirects) derives them from here so the URLs cannot drift.
 */

export const DEPLOY_ROUTE_PREFIX = "/docs/deploy";

/** Route of the self-host guides, and where the Deploy tab lands. */
export const SELF_HOST_ROUTE_PREFIX = `${DEPLOY_ROUTE_PREFIX}/self-host`;

/** Content-collection prefix of the bundle that carries the managed options. */
export const CLOUD_BUNDLE_ID = "cloud";

/** Bundle section -> URL segment under the Deploy prefix. */
const CLOUD_SECTIONS: Record<string, string> = {
	docs: "cloud",
	byoc: "byoc",
};

/**
 * Path under the Deploy prefix for a `cloud/...` content id, e.g.
 * `cloud/docs/compute` -> `cloud/compute`, `cloud/byoc` -> `byoc`. Undefined
 * for ids outside the bundle.
 */
export function deployRouteSlugForContentId(
	contentId: string,
): string | undefined {
	const [bundle, section, ...rest] = contentId.split("/");
	if (bundle !== CLOUD_BUNDLE_ID || !section) return undefined;
	const segment = CLOUD_SECTIONS[section];
	if (!segment) return undefined;
	return [segment, ...rest].join("/");
}

/**
 * Full site slug (no leading slash), e.g. `cloud/docs/compute` ->
 * `docs/deploy/cloud/compute`. This is where the Markdown mirror and search
 * index file the page.
 */
export function deploySlugForContentId(contentId: string): string | undefined {
	const routeSlug = deployRouteSlugForContentId(contentId);
	return routeSlug === undefined
		? undefined
		: `${DEPLOY_ROUTE_PREFIX.slice(1)}/${routeSlug}`;
}

/**
 * Site href of a self-host guide by its `src/content/self-host` slug. The
 * collection's `index` is the Deploy overview and lives at the section root,
 * not under `self-host/`, because it covers every deployment option.
 */
export function selfHostHref(guideSlug: string): string {
	return guideSlug === "index" || guideSlug === ""
		? `${DEPLOY_ROUTE_PREFIX}/`
		: `${SELF_HOST_ROUTE_PREFIX}/${guideSlug}/`;
}

/**
 * Route slug under the Deploy prefix for a self-host guide: `undefined` for
 * the overview (section root), `self-host/<slug>` otherwise.
 */
export function deployRouteSlugForSelfHostGuide(
	guideSlug: string,
): string | undefined {
	return guideSlug === "index" || guideSlug === ""
		? undefined
		: `${SELF_HOST_ROUTE_PREFIX.slice(DEPLOY_ROUTE_PREFIX.length + 1)}/${guideSlug}`;
}
