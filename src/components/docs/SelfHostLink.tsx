/**
 * Links between self-host guides.
 *
 * Relative hrefs do not work in the guides: they sit at three different depths
 * (`/docs/deploy/`, `/docs/deploy/self-host/workers/`, `.../workers/kubernetes/`), so no
 * single `../` prefix is correct everywhere, and hardcoding the section root
 * in every body would make the next move a mass edit.
 *
 * `<SelfHostLink to="control-plane/configuration">` takes a path relative to
 * the section root and the route binds it to `SELF_HOST_ROUTE_PREFIX`.
 */
export function createSelfHostLink(routePrefix: string) {
	return function SelfHostLink({
		to,
		children,
	}: {
		/** Path under the Self-Host root, e.g. `control-plane/ports`. */
		to: string;
		children: React.ReactNode;
	}) {
		const path = to.replace(/^\/+|\/+$/g, "");
		return <a href={path ? `${routePrefix}/${path}/` : `${routePrefix}/`}>{children}</a>;
	};
}
