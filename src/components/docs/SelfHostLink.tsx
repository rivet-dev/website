/**
 * Links between self-host guides.
 *
 * Guide bodies are authored once and generated for every product, so they
 * cannot hardcode `/actors/self-host/...`. Relative hrefs do not work either:
 * the guides sit at three different depths (`/p/self-host/`,
 * `/p/self-host/workers/`, `/p/self-host/workers/kubernetes/`), so no single
 * `../` prefix is correct everywhere.
 *
 * `<SelfHostLink to="control-plane/configuration">` takes a path relative to
 * the section root and the route binds it to the product being generated.
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
		return <a href={path ? `${routePrefix}/${path}` : `${routePrefix}/`}>{children}</a>;
	};
}
