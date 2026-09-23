import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
	faCloud,
	faDiagramNext,
	faPuzzlePiece,
	faRobot,
	faSparkles,
} from "@rivet-gg/icons";
import type { SidebarItem } from "@/lib/sitemap";
import rawSidebars from "@/generated/sidebars.json";
import { SIDEBAR_ICONS } from "@/generated/sidebar-icons";
import {
	PRODUCTS,
	ownsDocsBundle,
	VISIBLE_PRODUCTS,
	type ProductMetadata,
} from "./product-metadata";
import {
	deployOverviewGroup,
	deployWorkersGroup,
	selfHostGroup,
} from "./self-host";
import { CLOUD_BUNDLE_ID } from "./deploy";
import { rerootLearnHref, SITE_GUIDES_SIDEBAR_GROUP } from "./guides";
import { integrationSidebar } from "@/data/integrations";
import { integrationsHref } from "./integrations";
import { canonicalizeInternalHref } from "@/lib/internalHref";

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
		if (key === "href" && typeof value === "string") {
			out.href = canonicalizeInternalHref(value);
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
			byoc?: SidebarItem[];
		}
	>,
);

function bundleSidebars(bundleId: string) {
	const bundle = SIDEBARS[bundleId];
	if (!bundle) {
		throw new Error(
			`No sidebar for "${bundleId}". Run \`pnpm assemble\` to collect it from the product repo.`,
		);
	}
	return bundle;
}

function productSidebars(meta: ProductMetadata) {
	// A product whose Documentation tab links out (Sandboxes -> agentOS) has
	// no bundle of its own to read.
	if (!ownsDocsBundle(meta)) return { docs: [], integrations: [] };
	const bundle = bundleSidebars(meta.id);
	// A shared bundle's sidebar is authored against its source product's routes
	// (`/agentos/docs/...`); serve it under this product's instead.
	const docs = meta.bundleOf
		? rerootPrefix(bundle.docs, `/${meta.bundleOf}/docs`, `/${meta.id}/docs`)
		: bundle.docs;
	return {
		docs,
		integrations: bundle.integrations ?? [],
	};
}

function rerootPrefix<T>(node: T, from: string, to: string): T {
	if (Array.isArray(node)) {
		return node.map((item) => rerootPrefix(item, from, to)) as unknown as T;
	}
	if (!node || typeof node !== "object") return node;
	const out: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
		out[key] =
			key === "href" &&
			typeof value === "string" &&
			(value === from || value.startsWith(`${from}/`))
				? `${to}${value.slice(from.length)}`
				: rerootPrefix(value, from, to);
	}
	return out as T;
}

/**
 * The Deploy tab's sidebar: the overview, then the four options in the order
 * the overview lists them — Cloud (Rivet Cloud bundle), Deploy Workers,
 * BYOC (bundle), Self-Host. All of it renders under `/docs/deploy/` (see
 * `./deploy.ts`), owned by no product.
 */
export function deploySidebar(): SidebarItem[] {
	const cloud = bundleSidebars(CLOUD_BUNDLE_ID);
	return [
		deployOverviewGroup(),
		...cloud.docs,
		deployWorkersGroup(),
		...(cloud.byoc ?? []),
		selfHostGroup(),
	];
}

/**
 * The Guides tab's sidebar: the Actors bundle's `learn` section re-rooted at
 * `/guides/`, followed by the website-owned solution guides.
 */
export function guidesSidebar(): SidebarItem[] {
	const actors = bundleSidebars("actors");
	const learn = actors.learn ?? actors.tutorials ?? [];
	return [...rerootHrefs(learn), SITE_GUIDES_SIDEBAR_GROUP];
}

function rerootHrefs<T>(node: T): T {
	if (Array.isArray(node)) return node.map(rerootHrefs) as unknown as T;
	if (!node || typeof node !== "object") return node;
	const out: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
		out[key] =
			key === "href" && typeof value === "string"
				? rerootLearnHref(value)
				: rerootHrefs(value);
	}
	return out as T;
}

export type ProductTabId =
	"overview" | "use-cases" | "docs" | "integrations" | "registry";

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
	/** Listed everywhere except the Products menu. */
	hiddenFromSwitcher?: boolean;
	/** Built and routed but not launched: kept out of every listing. See HIDDEN.md. */
	unlaunched?: true;
	/** Short status chip shown next to the name. */
	badge?: string;
	/** Keeps its own marketing page and subnav; not part of the docs tab strip. */
	standalone?: true;
	/** URL segment and content-collection prefix, e.g. `actors`. */
	id: string;
	name: string;
	/** One line for the product switcher. */
	description: string;
	/** Verb eyebrow for the pillar framing (Orchestrate / Operate / Automate / Deploy). */
	verb?: string;
	/** Premise line for the verb framing. No terminal period. */
	premise?: string;
	/** Where a product link lands: its marketing page if it has one, else its docs. */
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
 * Overview is the product's marketing page and carries no sidebar. Deployment
 * is a property of the platform, not of the product, so no product owns a
 * Deploy tab: the guides live once under `/docs/deploy/`, reached from the
 * header's Documentation menu.
 */
/** Fallback marks for products with no wordmark SVG. */
const PRODUCT_GLYPHS: Record<string, IconDefinition | undefined> = {
	"dynamic-apps": faSparkles,
	workflows: faDiagramNext,
	agents: faRobot,
	integrations: faPuzzlePiece,
	cloud: faCloud,
};

/**
 * Product repos title their docs root "Introduction"; on this site the root
 * carries the product overview, so the sidebar calls it that.
 */
function withOverviewTitle(
	sidebar: SidebarItem[],
	rootHref: string,
): SidebarItem[] {
	return sidebar.map((item) => {
		if (!("pages" in item) || !item.pages) return item;
		return {
			...item,
			pages: item.pages.map((page) =>
				"href" in page && page.href?.replace(/\/$/, "") === rootHref
					? { ...page, title: "Overview" }
					: page,
			),
		};
	});
}

function tabs(
	meta: ProductMetadata,
	sidebars: { docs: SidebarItem[]; integrations: SidebarItem[] },
): ProductTab[] {
	const id = meta.id;
	const has = (tab: "integrations" | "registry") =>
		meta.optionalTabs.includes(tab);

	const all: ProductTab[] = [
		// Only products that still have a marketing page (an explicit `tabs`
		// list naming it) keep an Overview tab; the pillars open on their docs.
		...(meta.tabs?.includes("overview")
			? [
					{
						id: "overview" as const,
						title: "Overview",
						href: `/${id}/`,
						sidebar: [],
					},
				]
			: []),
		{
			// A single page, not a section: no sidebar.
			id: "use-cases",
			title: "Use Cases",
			href: `/${id}/use-cases/`,
			sidebar: [],
		},
		{
			id: "docs",
			title: "Documentation",
			// A product whose docs are served under another (Sandboxes -> agentOS)
			// links out; the tab owns no pages here.
			href: meta.docsHome ?? `/${id}/docs/`,
			// Standalone subsites keep their bundle's own root title: their docs
			// still open on an introduction, not on the former landing page.
			sidebar: meta.docsHome
				? []
				: meta.standalone
					? sidebars.docs
					: withOverviewTitle(sidebars.docs, `/${id}/docs`),
		},
		...(has("integrations")
			? [
					{
						id: "integrations" as const,
						title: "Integrations",
						// The site product's integrations sit at the root (`/integrations/`),
						// rendered by their own route; the tab then links out of the vertical.
						href: integrationsHref(id),
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
						href: `/${id}/registry/`,
						sidebar: [],
					},
				]
			: []),
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
export const products: Product[] = PRODUCTS.map((meta) => {
	// A shared section (Integrations) has no bundle to read a sidebar from and
	// no routes to list; it exists here for its name, mark, and accent.
	const productTabs = meta.section ? [] : tabs(meta, productSidebars(meta));
	const landing =
		productTabs.find((tab) => tab.id === "overview") ??
		productTabs.find((tab) => tab.id === "docs");
	return {
		id: meta.id,
		name: meta.name,
		description: meta.tagline,
		verb: meta.verb,
		premise: meta.premise,
		href: meta.landing ?? landing?.href ?? `/${meta.id}/docs/`,
		icon: PRODUCT_GLYPHS[meta.id],
		hidden: meta.hidden,
		hiddenFromSwitcher: meta.hiddenFromSwitcher,
		unlaunched: meta.unlaunched,
		badge: meta.badge,
		standalone: meta.standalone,
		tabs: productTabs,
	};
});

/** The pillars, in display order. Everything user-facing lists these. */
export const visibleProducts = products.filter(
	(product) => !product.hidden && !product.unlaunched,
);

/**
 * Whether a product may appear in a listing. Unlaunched products are built and
 * routed but named nowhere until they ship.
 */
export function isListed(productId: string): boolean {
	return !getProduct(productId)?.unlaunched;
}

/**
 * What the Products menu offers. A product may be documented and listed
 * elsewhere while still not belonging in the switcher.
 */
export const switcherProducts = visibleProducts.filter(
	(product) => !product.hiddenFromSwitcher,
);

/**
 * The four pillars: the verb-led set the homepage stack and its diagrams are
 * composed around. Anything without a verb has no plate to stand on.
 */
export const pillarProducts = visibleProducts.filter((product) => product.verb);

/** The tabs a standalone product's own subnav lists (its Overview is the label). */
export function visibleTabs(product: Product): ProductTab[] {
	return product.tabs.filter((tab) => !tab.hidden && tab.id !== "overview");
}

/** Products that keep their own subsite instead of joining the docs tab strip. */
export const standaloneProducts = products.filter(
	(product) => product.standalone,
);

/** The standalone product a path sits inside, e.g. `/agentos/docs/state`. */
export function findStandaloneProduct(pathname: string): Product | undefined {
	const [, first] = pathname.split("/");
	return standaloneProducts.find((product) => product.id === first);
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
