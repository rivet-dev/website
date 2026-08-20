import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faCloud, faDiagramNext, faSparkles } from "@rivet-gg/icons";
import type { SidebarItem } from "@/lib/sitemap";
import rawSidebars from "@/generated/sidebars.json";
import { SIDEBAR_ICONS } from "@/generated/sidebar-icons";
import { PRODUCTS, VISIBLE_PRODUCTS, type ProductMetadata } from "./product-metadata";
import { deploySidebar } from "./self-host";
import { integrationSidebar } from "@/data/integrations";

/**
 * Sidebars come from each product's own repo, collected into
 * `src/generated/sidebars.json` by `scripts/assemble.mjs`. Icons travel as
 * export names so product repos need no dependency on the icon package; they
 * are resolved back here.
 */
function hydrateIcons<T>(node: T): T {
	if (Array.isArray(node)) return node.map(hydrateIcons) as unknown as T;
	if (!node || typeof node !== "object") return node;

	const out: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
		if (key === "icon" && typeof value === "string") {
			const icon = SIDEBAR_ICONS[value];
			if (icon) out.icon = icon;
			continue;
		}
		out[key] = hydrateIcons(value);
	}
	return out as T;
}

const SIDEBARS = hydrateIcons(
	rawSidebars as Record<
		string,
		{
			docs: SidebarItem[];
			learn?: SidebarItem[];
			tutorials?: SidebarItem[];
			integrations?: SidebarItem[];
		}
	>,
);

function productSidebars(productId: string) {
	const bundle = SIDEBARS[productId];
	if (!bundle) {
		throw new Error(
			`No sidebar for "${productId}". Run \`pnpm assemble\` to collect it from the product repo.`,
		);
	}
	return {
		docs: bundle.docs,
		learn: bundle.learn ?? bundle.tutorials ?? [],
		integrations: bundle.integrations ?? [],
	};
}

export type ProductTabId =
	| "overview"
	| "use-cases"
	| "learn"
	| "docs"
	| "integrations"
	| "registry"
	| "self-host";

export interface ProductTab {
	id: ProductTabId;
	title: string;
	href: string;
	/** Routed, but not rendered in the nav. See HIDDEN.md. */
	hidden?: boolean;
	/** Empty for Overview, which is the product's marketing page. */
	sidebar: SidebarItem[];
}

export interface Product {
	/** Kept out of the switcher and the docs index. Still routed. */
	hidden?: boolean;
	/** Short status chip shown next to the name. */
	badge?: string;
	/** URL segment and content-collection prefix, e.g. `actors`. */
	id: string;
	name: string;
	/** One line for the product switcher. */
	description: string;
	/** Verb eyebrow for the pillar framing (Run / Operate / Automate / Deploy). */
	verb?: string;
	/** Premise line for the verb framing. No terminal period. */
	premise?: string;
	/** Marketing page. */
	href: string;
	/**
	 * Glyph fallback for products without a wordmark. Wordmarks are resolved by
	 * id from `./productLogos`, which is Vite-only and therefore kept out of this
	 * module so the registry stays loadable under plain tsx.
	 */
	icon?: IconDefinition;
	tabs: ProductTab[];
}

/**
 * Every product exposes the same five tabs, so the secondary nav is identical
 * across products and on marketing pages as well as docs.
 *
 * Overview is the product's marketing page and carries no sidebar. Self-Host is
 * generated from `deployMatrix` rather than shipped in the product's bundle,
 * because deployment is a property of the platform, not of the product.
 */
/** Fallback marks for products with no wordmark SVG. */
const PRODUCT_GLYPHS: Record<string, IconDefinition | undefined> = {
	"dynamic-apps": faSparkles,
	workflows: faDiagramNext,
	cloud: faCloud,
};

function tabs(
	meta: ProductMetadata,
	sidebars: { docs: SidebarItem[]; learn: SidebarItem[]; integrations: SidebarItem[] },
): ProductTab[] {
	const id = meta.id;
	const has = (tab: "learn" | "integrations" | "registry") =>
		meta.optionalTabs.includes(tab);

	const all: ProductTab[] = [
		{ id: "overview", title: "Overview", href: `/${id}`, sidebar: [] },
		{
			// A single page, not a section: no sidebar.
			id: "use-cases",
			title: "Use Cases",
			href: `/${id}/use-cases`,
			sidebar: [],
		},
		...(has("learn")
			? [
					{
						id: "learn" as const,
						title: "Learn",
						href: `/${id}/learn`,
						sidebar: sidebars.learn,
					},
				]
			: []),
		{
			id: "docs",
			title: "Documentation",
			href: `/${id}/docs`,
			sidebar: sidebars.docs,
		},
		...(has("integrations")
			? [
					{
						id: "integrations" as const,
						title: "Integrations",
						href: `/${id}/integrations`,
						// Built here, not from the bundle: the sidebar carries vendor
						// logos and category groups, which a product repo's sidebar.json
						// has no way to express.
						sidebar: integrationSidebar(id),
					},
				]
			: []),
		...(has("registry")
			? [
					{
						// A standalone catalog with its own layout, not a docs section.
						id: "registry" as const,
						title: "Registry",
						href: `/${id}/registry`,
						sidebar: [],
					},
				]
			: []),
		{
			id: "self-host",
			title: "Self-Host",
			href: `/${id}/self-host`,
			sidebar: deploySidebar(id),
		},
	];

	const hidden = new Set<string>(meta.hiddenTabs ?? []);
	const marked = all.map((tab) =>
		hidden.has(tab.id) ? { ...tab, hidden: true } : tab,
	);

	// An explicit list narrows the set; without one a product gets them all.
	if (!meta.tabs) return marked;
	const wanted = new Set<ProductTabId>(meta.tabs);
	return marked.filter((tab) => wanted.has(tab.id));
}

// Built from the metadata so name, tagline, and order live in exactly one file.
export const products: Product[] = PRODUCTS.map((meta) => ({
	id: meta.id,
	name: meta.name,
	description: meta.tagline,
	verb: meta.verb,
	premise: meta.premise,
	href: `/${meta.id}`,
	icon: PRODUCT_GLYPHS[meta.id],
	hidden: meta.hidden,
	badge: meta.badge,
	tabs: tabs(meta, productSidebars(meta.id)),
}));

/** The pillars, in display order. Everything user-facing lists these. */
export const visibleProducts = products.filter((product) => !product.hidden);

/** Tabs to render in the nav for a product: everything except hidden ones. */
export function visibleTabs(product: Product): ProductTab[] {
	return product.tabs.filter((tab) => !tab.hidden);
}

export const productIds = products.map((product) => product.id);

export function getProduct(productId: string): Product | undefined {
	return products.find((product) => product.id === productId);
}

/**
 * Resolves the product and tab that own a site path, e.g. `/actors/docs/state`.
 * Returns undefined for paths outside the product verticals.
 */
export function findProductForPath(
	pathname: string,
): { product: Product; tab: ProductTab } | undefined {
	const [, productId, tabId] = pathname.split("/");
	const product = getProduct(productId ?? "");
	if (!product) return undefined;
	const tab = product.tabs.find((candidate) => candidate.id === tabId);
	if (!tab) return undefined;
	return { product, tab };
}
