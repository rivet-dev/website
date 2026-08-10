import { integrationSidebarSections } from "@/data/integrations";
import { faSquareInfo } from "@rivet-gg/icons";
import type { Sitemap } from "@/lib/sitemap";
import { products } from "./products";

export * from "./products";

// The docs theme's helpers (`findActiveTab`, `findPageForHref`) walk a flat list
// of tabs. The site's real structure is two-dimensional now — four products,
// three tabs each — so the flat sitemap is derived rather than authored, and the
// product registry in `./products.ts` is the single source of truth.
//
// Sections that are not owned by a single product (integrations today, and the
// merged deploy/self-hosting story once it is rewritten) stay outside the
// product verticals and are appended here.
export const sitemap = [
	...products.flatMap((product) =>
		product.tabs.map((tab) => ({
			title: `${product.name} ${tab.title}`,
			href: tab.href,
			sidebar: tab.sidebar,
		})),
	),
	{
		title: "Integrations",
		href: "/integrations",
		sidebar: [
			{
				title: "General",
				pages: [
					{
						title: "Overview",
						href: "/integrations",
						icon: faSquareInfo,
					},
				],
			},
			...integrationSidebarSections,
		],
	},
] satisfies Sitemap;
