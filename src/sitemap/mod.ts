import type { Sitemap } from "@/lib/sitemap";
import { deploySidebar, guidesSidebar, products } from "./products";
import { overviewSidebar } from "./overview";
import { DEPLOY_ROUTE_PREFIX } from "./deploy";
import { GUIDES_ROUTE_PREFIX } from "./guides";
import { INTEGRATIONS_ROUTE_PREFIX, SITE_INTEGRATIONS_PRODUCT } from "./integrations";
import { SITE_DOCS_ROUTE_PREFIX } from "./docs-sources";
import { integrationSidebar } from "@/data/integrations";

export * from "./products";

// The docs theme's helpers (`findActiveTab`, `findPageForHref`) walk a flat list
// of tabs. The site's real structure is two-dimensional now — four products,
// a handful of tabs each — so the flat sitemap is derived rather than authored, and the
// product registry in `./products.ts` is the single source of truth.
//
// Products come first so a page linked from several sidebars resolves to the
// product that owns it. The site-wide sections (Overview, Guides, Deploy,
// Integrations) own no product and follow.
export const sitemap = [
	...products.flatMap((product) =>
		product.tabs
			// A tab that links out (Sandboxes' Documentation -> /agentos/docs/)
			// owns no pages; the target product's own tab resolves them.
			.filter((tab) => tab.href.startsWith(`/${product.id}/`))
			.map((tab) => ({
				title: `${product.name} ${tab.title}`,
				href: tab.href,
				sidebar: tab.sidebar,
			})),
	),
	{
		title: "Overview",
		href: `${SITE_DOCS_ROUTE_PREFIX}/`,
		sidebar: overviewSidebar,
	},
	{
		title: "Guides",
		href: `${GUIDES_ROUTE_PREFIX}/`,
		sidebar: guidesSidebar(),
	},
	{
		title: "Deploy",
		href: `${DEPLOY_ROUTE_PREFIX}/`,
		sidebar: deploySidebar(),
	},
	{
		title: "Integrations",
		href: `${INTEGRATIONS_ROUTE_PREFIX}/`,
		sidebar: integrationSidebar(SITE_INTEGRATIONS_PRODUCT),
	},
] satisfies Sitemap;
