import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faDiagramNext, faGrid2 } from "@rivet-gg/icons";
import type { SidebarItem } from "@/lib/sitemap";
import rawSidebars from "@/generated/sidebars.json";
import { SIDEBAR_ICONS } from "@/generated/sidebar-icons";
import { deploySidebar } from "./self-host";

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
	rawSidebars as Record<string, { docs: SidebarItem[]; tutorials?: SidebarItem[] }>,
);

function productSidebars(productId: string) {
	const bundle = SIDEBARS[productId];
	if (!bundle) {
		throw new Error(
			`No sidebar for "${productId}". Run \`pnpm assemble\` to collect it from the product repo.`,
		);
	}
	return { docs: bundle.docs, tutorials: bundle.tutorials ?? [] };
}

export type ProductTabId = "docs" | "tutorials" | "self-host";

export interface ProductTab {
	id: ProductTabId;
	title: string;
	href: string;
	sidebar: SidebarItem[];
}

export interface Product {
	/** URL segment and content-collection prefix, e.g. `actors`. */
	id: string;
	name: string;
	/** One line for the product switcher. */
	description: string;
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

// The Self-Host tab covers both halves of the deployment story. The rename from
// "Deploy" holds semantically: BYOC is self-hosting your compute, so running
// your own workers against Rivet Cloud belongs here too.
function tabs(
	productId: string,
	sidebars: { docs: SidebarItem[]; tutorials: SidebarItem[] },
): ProductTab[] {
	return [
		{
			id: "docs",
			title: "Documentation",
			href: `/${productId}/docs`,
			sidebar: sidebars.docs,
		},
		{
			id: "tutorials",
			title: "Tutorials",
			href: `/${productId}/tutorials`,
			sidebar: sidebars.tutorials,
		},
		{
			id: "self-host",
			title: "Self-Host",
			href: `/${productId}/self-host`,
			sidebar: deploySidebar(productId),
		},
	];
}

// Display order is fixed: Actors, agentOS, Dynamic Apps, Workflows.
export const products: Product[] = [
	{
		id: "actors",
		name: "Actors",
		description: "Where agents live: state, identity, durability",
		href: "/actors",
		tabs: tabs("actors", productSidebars("actors")),
	},
	{
		id: "agentos",
		name: "agentOS",
		description: "How agents act: file system, shell, tools",
		href: "/agentos",
		tabs: tabs("agentos", productSidebars("agentos")),
	},
	{
		id: "dynamic-apps",
		name: "Dynamic Apps",
		description: "User-generated apps as isolated, durable instances",
		href: "/dynamic-apps",
		icon: faGrid2,
		tabs: tabs("dynamic-apps", productSidebars("dynamic-apps")),
	},
	{
		id: "workflows",
		name: "Workflows",
		description: "Durable, replayable multi-step operations",
		href: "/workflows",
		icon: faDiagramNext,
		tabs: tabs("workflows", productSidebars("workflows")),
	},
];

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
