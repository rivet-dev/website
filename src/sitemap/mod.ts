import type { Sitemap } from "@/lib/sitemap";
import { products } from "./products";

export * from "./products";

// The docs theme's helpers (`findActiveTab`, `findPageForHref`) walk a flat list
// of tabs. The site's real structure is two-dimensional now — four products,
// a handful of tabs each — so the flat sitemap is derived rather than authored, and the
// product registry in `./products.ts` is the single source of truth.
//
// Every docs section is owned by a product now, so the flat sitemap is exactly
// the product tabs.
export const sitemap = [
	...products.flatMap((product) =>
		product.tabs.map((tab) => ({
			title: `${product.name} ${tab.title}`,
			href: tab.href,
			sidebar: tab.sidebar,
		})),
	),
] satisfies Sitemap;
