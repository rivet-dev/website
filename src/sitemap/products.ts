import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
	faCloud,
	faDiagramNext,
	faPuzzlePiece,
	faRobot,
	faSparkles,
	faSquareInfo,
} from "@rivet-gg/icons";
import type { SidebarItem, SidebarSection } from "@/lib/sitemap";
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
import { API_DOCS_NAMESPACE, SITE_DOCS_NAMESPACE } from "./docs-sources";
import { CLOUD_BUNDLE_ID } from "./deploy";
import { GUIDE_BUNDLES, guideHref } from "./guides";
import { integrationFold, integrationSidebar } from "@/data/integrations";
import { registryFold } from "@/data/registry";
import { integrationsHref, SITE_INTEGRATIONS_PRODUCT } from "./integrations";
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

// Icons are export names in the JSON and become `IconDefinition`s here, so the
// raw JSON is not yet the hydrated shape.
const SIDEBARS = hydrateIcons(
	rawSidebars as unknown as Record<
		string,
		{
			docs: SidebarItem[];
			guides?: SidebarItem[];
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
	// A product whose Documentation tab links out (`docsHome`) has no bundle
	// of its own to read.
	if (!ownsDocsBundle(meta)) return { docs: [], integrations: [] };
	const bundle = bundleSidebars(meta.id);
	// A shared bundle's sidebar is authored against its source product's routes
	// (`/agentos/docs/...`); serve it under this product's instead.
	const ownDocs = mirrorGuides(bundle.docs, bundle.guides ?? []);
	const docs = meta.bundleOf
		? rerootPrefix(ownDocs, `/${meta.bundleOf}/docs`, `/${meta.id}/docs`)
		: ownDocs;
	return {
		docs,
		integrations: bundle.integrations ?? [],
	};
}

/**
 * Fills a `"mirror": "guides"` group in a bundle's docs sidebar with the
 * bundle's own guides, so a docs tab can list them without repeating them:
 *
 *     { "title": "Guides", "collapsible": true, "mirror": "guides" }
 *
 * The pages keep their `/guides/...` hrefs, so they open on the Guides tab.
 */
function mirrorGuides<T>(node: T, guides: SidebarItem[]): T {
	if (Array.isArray(node)) {
		return node.map((item) => mirrorGuides(item, guides)) as unknown as T;
	}
	if (!node || typeof node !== "object") return node;
	const { mirror, ...rest } = node as Record<string, unknown>;
	if (mirror === undefined) {
		return Object.fromEntries(
			Object.entries(rest).map(([key, value]) => [
				key,
				mirrorGuides(value, guides),
			]),
		) as T;
	}
	if (mirror !== "guides") {
		throw new Error(`sidebar.json: unknown "mirror" value ${JSON.stringify(mirror)}`);
	}
	return {
		...rest,
		pages: guides.flatMap((group) => ("pages" in group ? group.pages : [group])),
	} as T;
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
 * The product-agnostic docs sidebar at `/docs/`. Authored in `rivet-dev/rivet`'s
 * `docs/general` bundle; see `SITE_DOCS_NAMESPACE`.
 */
export function siteDocsSidebar(): SidebarItem[] {
	return bundleSidebars(SITE_DOCS_NAMESPACE).docs;
}

/**
 * The HTTP API reference sidebar at `/docs/api/`. Authored (mostly generated)
 * in `rivet-dev/rivet`'s `docs/api` bundle; see `API_DOCS_NAMESPACE`.
 */
export function apiDocsSidebar(): SidebarItem[] {
	return bundleSidebars(API_DOCS_NAMESPACE).docs;
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

/** Guides tab groups in sidebar order, after General. Groups not listed follow in product order. */
const GUIDE_GROUP_ORDER = ["Architecture", "Agents", "Guides"];

/**
 * The Guides tab's sidebar: the website's overview, then every bundle's
 * `guides` groups, ordered by `GUIDE_GROUP_ORDER`. Groups with the same title
 * merge into one, keeping each bundle's page order.
 */
export function guidesSidebar(): SidebarItem[] {
	const overview: SidebarSection = {
		title: "General",
		pages: [{ title: "Overview", href: guideHref(""), icon: faSquareInfo }],
	};
	const merged: SidebarSection[] = [];
	for (const bundleId of GUIDE_BUNDLES) {
		for (const item of SIDEBARS[bundleId]?.guides ?? []) {
			if (!("pages" in item)) {
				throw new Error(
					`${bundleId}/sidebar.json: every "guides" entry must be a group with "title" and "pages"`,
				);
			}
			const group = merged.find((candidate) => candidate.title === item.title);
			if (group) group.pages.push(...item.pages);
			else merged.push({ ...item, pages: [...item.pages] });
		}
	}
	const rank = (group: SidebarSection) => {
		const index = GUIDE_GROUP_ORDER.indexOf(group.title);
		return index === -1 ? GUIDE_GROUP_ORDER.length : index;
	};
	merged.sort((a, b) => rank(a) - rank(b));
	return [overview, ...merged];
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

/**
 * A product's Documentation sidebar: its bundle's own sidebar, plus the pages
 * this site adds to it. The Registry and a non-site product's Integrations are
 * folds at the end of the opening General group, so they sit inside a group
 * like every other page.
 */
function docsSidebar(meta: ProductMetadata, bundleDocs: SidebarItem[]): SidebarItem[] {
	const has = (section: "integrations" | "registry") =>
		meta.optionalTabs.includes(section);
	const fold =
		has("integrations") && meta.id !== SITE_INTEGRATIONS_PRODUCT
			? integrationFold(meta.id)
			: undefined;
	const folds = [...(has("registry") ? [registryFold(meta.id)] : []), ...(fold ? [fold] : [])];
	const docs = [...bundleDocs];
	if (folds.length > 0) {
		const general = docs.findIndex(
			(item) => "pages" in item && "title" in item && item.title === "General",
		);
		const group = docs[general];
		if (group && "pages" in group) {
			docs[general] = { ...group, pages: [...group.pages, ...folds] };
		} else {
			docs.unshift(...folds);
		}
	}
	return docs;
}

function tabs(
	meta: ProductMetadata,
	sidebars: { docs: SidebarItem[]; integrations: SidebarItem[] },
): ProductTab[] {
	const id = meta.id;

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
			// A product whose docs are served under another (`docsHome`) links
			// out; the tab owns no pages here.
			href: meta.docsHome ?? `/${id}/docs/`,
			// Standalone subsites keep their bundle's own root title: their docs
			// still open on an introduction, not on the former landing page.
			sidebar: meta.docsHome
				? []
				: docsSidebar(
						meta,
						meta.standalone
							? sidebars.docs
							: withOverviewTitle(sidebars.docs, `/${id}/docs`),
					),
		},
		// Only the site product's Integrations is a tab (linking to the root
		// section). Any other product's integrations are a fold in its docs
		// sidebar; see `docsSidebar`.
		...(meta.optionalTabs.includes("integrations") && id === SITE_INTEGRATIONS_PRODUCT
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
