/**
 * The docs subnav: one fixed strip shown on every docs page, whatever product
 * the page belongs to. There is no product-specific subnav; product context
 * comes from the sidebar and the page itself.
 *
 * The strip has two groups, split by a hairline: the orchestration docs
 * (Overview, Platform, Deploy, API), then the actor types and what runs on them.
 * Actor-type tabs and Integrations carry the product's mark inline.
 *
 * Overview, Platform, Deploy, and API are site-wide sections owned by no product
 * (`/docs/` and `/guides/`, the other `/docs/` pages, `/docs/deploy/`,
 * `/docs/api/`, `/integrations/`). See `./overview.ts`. Standalone
 * subsites (`Product.standalone`) are excluded: they keep their own second
 * header row, so their tab here links out and never lights up.
 */
import { DEPLOY_ROUTE_PREFIX, SELF_HOST_ROUTE_PREFIX } from "./deploy";
import { API_DOCS_ROUTE_PREFIX } from "./docs-sources";
import { GUIDES_ROUTE_PREFIX } from "./guides";
import { INTEGRATIONS_ROUTE_PREFIX } from "./integrations";
import { PLATFORM_DOCS_HREF } from "./overview";
import { PRODUCTS } from "./product-metadata";

const unlaunched = new Set(
	PRODUCTS.filter((product) => product.unlaunched).map((product) => product.id),
);

export type DocsTabId =
	| "overview"
	| "platform"
	| "deploy"
	| "api"
	| "actors"
	| "agents"
	| "workflows"
	| "agentos"
	| "dynamic-apps"
	| "integrations";

export type DocsTabGroup = "orchestration" | "actors";

export interface DocsTab {
	id: DocsTabId;
	title: string;
	href: string;
	group: DocsTabGroup;
	/** Product whose mark rides inline before the title. */
	productId?: string;
}

// Unlaunched products (see `ProductMetadata.unlaunched`) keep their tab
// definition but are filtered out of the strip until they ship.
export const DOCS_TABS: readonly DocsTab[] = (
	[
		{
			id: "overview",
			title: "Overview",
			href: "/docs/",
			group: "orchestration",
		},
		{
			id: "platform",
			title: "Platform",
			href: PLATFORM_DOCS_HREF,
			group: "orchestration",
		},
		{
			id: "deploy",
			title: "Deploy",
			href: `${DEPLOY_ROUTE_PREFIX}/`,
			group: "orchestration",
		},
		{
			id: "api",
			title: "API",
			href: `${API_DOCS_ROUTE_PREFIX}/`,
			group: "orchestration",
		},
		{
			id: "actors",
			title: "Actors",
			href: "/actors/docs/",
			group: "actors",
			productId: "actors",
		},
		{
			id: "agents",
			title: "Agents",
			href: "/agents/docs/",
			group: "actors",
			productId: "agents",
		},
		{
			id: "workflows",
			title: "Workflows",
			href: "/workflows/docs/",
			group: "actors",
			productId: "workflows",
		},
		{
			id: "agentos",
			title: "agentOS",
			href: "/agentos/docs/",
			group: "actors",
			productId: "agentos",
		},
		{
			id: "dynamic-apps",
			title: "Dynamic Apps",
			href: "/dynamic-apps/docs/",
			group: "actors",
			productId: "dynamic-apps",
		},
		{
			id: "integrations",
			title: "Integrations",
			href: `${INTEGRATIONS_ROUTE_PREFIX}/`,
			group: "actors",
			productId: "integrations",
		},
	] satisfies DocsTab[]
).filter((tab) => !tab.productId || !unlaunched.has(tab.productId));

/** Products whose docs (and registry) pages light up their own tab. */
const PRODUCT_TABS: Record<string, DocsTabId> = {
	actors: "actors",
	agents: "agents",
	workflows: "workflows",
	agentos: "agentos",
	"dynamic-apps": "dynamic-apps",
};

/**
 * Which tab a docs path belongs to. Undefined for pages that have no tab of
 * their own, such as the standalone subsites (Secure Exec), which
 * render their own product bar instead.
 */
export function activeDocsTab(pathname: string): DocsTabId | undefined {
	const trimmed = pathname.replace(/\/$/, "");
	const [, first, second] = trimmed.split("/");
	if (!first) return undefined;
	// Guides keep their `/guides/` URLs but live in the Overview sidebar.
	if (`/${first}` === GUIDES_ROUTE_PREFIX) return "overview";
	if (`/${first}` === INTEGRATIONS_ROUTE_PREFIX) return "integrations";
	if (
		trimmed === DEPLOY_ROUTE_PREFIX ||
		trimmed.startsWith(`${DEPLOY_ROUTE_PREFIX}/`)
	) {
		return "deploy";
	}
	// The HTTP API reference nests under `/docs/` like Deploy does, so it must
	// be claimed before the catch-all below hands it to Overview.
	if (
		trimmed === API_DOCS_ROUTE_PREFIX ||
		trimmed.startsWith(`${API_DOCS_ROUTE_PREFIX}/`)
	) {
		return "api";
	}
	// The rest of `/docs/` is product-agnostic: the overview itself, then the
	// Platform pages, including the canonical AI Tools pages. Each product carries
	// its own contextual alias under `/<product>/docs/ai/`, so no page here
	// belongs to a product tab.
	if (first === "docs") return second ? "platform" : "overview";
	if (PRODUCTS.some((product) => product.id === first && product.standalone))
		return undefined;
	if (second === "docs" || second === "registry") return PRODUCT_TABS[first];
	return undefined;
}
