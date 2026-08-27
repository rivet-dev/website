/**
 * Single source of truth for everything that describes a product.
 *
 * Name, tagline, owning repo, and accent color all live here. Adding a product
 * means adding one entry; the registry, the docs-source resolver, the assemble
 * script, and the Tailwind accent tokens are all derived from it.
 *
 * Accent colors sit in the same muted register as the editorial palette
 * (`accent` #CB5A33, `pine` #2E4034) rather than shouting, and each lands
 * between 5.4:1 and 6.5:1 against the porcelain field (#EFEFEF) so it reads as
 * text without going harsh.
 *
 * `repo` is the GitHub repository *and* the sibling directory name that
 * `scripts/assemble.mjs` looks for. Note `actors` -> `rivet`: the Actors product
 * lives in the main Rivet repo, so the mapping cannot be derived from the id.
 */
export interface ProductMetadata {
	/** URL segment and content-collection prefix. */
	id: string;
	name: string;
	/** One line, used in the product switcher and the docs index. */
	tagline: string;
	/**
	 * Verb-led framing for the four pillars (Orchestrate / Operate / Automate /
	 * Deploy): the eyebrow verb and its premise line, shared by the Products
	 * menu and the landing stack section so the set is defined once. Absent on
	 * non-pillar products (Rivet Cloud).
	 */
	verb?: string;
	/** Premise line for the verb framing. No terminal period. */
	premise?: string;
	/** Repository and sibling directory that owns this product's docs. */
	repo: string;
	/** Accent hex, and its contrast against #EFEFEF for the record. */
	color: string;
	contrast: number;
	/**
	 * Tabs beyond the four every product has (Overview, Use Cases,
	 * Documentation, Self-Host). A product without the content for one simply
	 * does not show the tab.
	 */
	optionalTabs: ("learn" | "integrations" | "registry")[];
	/**
	 * Restricts the tab set. Omit for the standard set. Rivet Cloud is a managed
	 * platform rather than a library, so it has no Use Cases or Self-Host.
	 */
	tabs?: ("overview" | "use-cases" | "learn" | "docs" | "integrations" | "registry" | "self-host")[];
	/**
	 * Tabs that still build but are not shown in the nav.
	 *
	 * Distinct from omitting them from `tabs`: those routes disappear, which
	 * breaks every inbound link and redirect pointing at them. A hidden tab keeps
	 * its pages reachable by URL while the section is unfinished. Track these in
	 * HIDDEN.md.
	 */
	hiddenTabs?: ("use-cases" | "learn" | "integrations" | "registry")[];
	/**
	 * Kept out of the product switcher and the /docs index. The vertical still
	 * builds and is linked from its own pages; it is just not one of the pillars.
	 */
	hidden?: boolean;
	/** Short status chip shown next to the name, e.g. "Preview". */
	badge?: string;
	/**
	 * Bundle path inside this repo, relative to the repo root, for products whose
	 * docs are not owned by a sibling repository. Shaped exactly like a product
	 * repo (`<bundle>/docs/sidebar.json`, `<bundle>/docs/content/**`) so moving
	 * these docs out later is a delete plus a checkout.
	 */
	localBundle?: string;
	/**
	 * Product whose repo owns this one's code snippets.
	 *
	 * Snippets resolve from the repo that owns the docs, but a product can be
	 * split out before its `examples/` tree is. Workflows docs still reference
	 * `examples/docs/actors-workflows/**` in the Rivet repo, and Dynamic Apps
	 * references `examples/apps-*` in the agentOS repo. Drop this once the
	 * examples move with the docs.
	 */
	snippetFrom?: string;
}

/** Display order across the whole site. */
export const PRODUCTS: ProductMetadata[] = [
	{
		id: "actors",
		name: "Actors",
		tagline: "The primitive for agent orchestration",
		verb: "Orchestrate",
		premise: "Give every agent a durable process to live in",
		repo: "rivet",
		color: "#2C5A7A",
		contrast: 6.41,
		optionalTabs: ["learn", "integrations"],
		hiddenTabs: ["use-cases", "learn"],
	},
	{
		id: "agentos",
		name: "agentOS",
		tagline: "A computer for every agent",
		verb: "Operate",
		premise: "Hand every agent a computer of its own",
		repo: "agentos",
		color: "#9C3A3F",
		contrast: 5.91,
		optionalTabs: ["integrations", "registry"],
		hiddenTabs: ["use-cases"],
	},
	{
		id: "workflows",
		name: "Workflows",
		tagline: "Durable, replayable multi-step operations",
		verb: "Automate",
		premise: "Write multi-step operations that survive restarts",
		repo: "workflows",
		color: "#6A4C93",
		contrast: 5.95,
		snippetFrom: "actors",
		optionalTabs: [],
		hiddenTabs: ["use-cases"],
	},
	{
		id: "dynamic-apps",
		name: "Dynamic Apps",
		badge: "Preview",
		tagline: "Deploy an AI-generated backend for every user",
		verb: "Deploy",
		premise: "Deploy the backends your agents build",
		repo: "dynamic-apps",
		color: "#2F6B4B",
		contrast: 5.49,
		snippetFrom: "agentos",
		optionalTabs: [],
		hiddenTabs: ["use-cases"],
	},
	{
		id: "cloud",
		name: "Rivet Cloud",
		tagline: "Managed Rivet, deployed and operated for you",
		repo: "rivet-website",
		localBundle: "cloud",
		color: "#8A5A2B",
		contrast: 5.72,
		optionalTabs: [],
		tabs: ["overview", "docs"],
		hidden: true,
	},
];

export const PRODUCT_IDS = PRODUCTS.map((product) => product.id);

/** The pillars: what the switcher and the docs index list. */
export const VISIBLE_PRODUCTS = PRODUCTS.filter((product) => !product.hidden);

export function getProductMetadata(
	productId: string,
): ProductMetadata | undefined {
	return PRODUCTS.find((product) => product.id === productId);
}

/**
 * Flattened into `product-<id>` / `-soft` / `-hairline` Tailwind tokens.
 * Consumed by `tailwind.config.ts`.
 */
export function productColorTokens(): Record<string, string> {
	const tokens: Record<string, string> = {};
	for (const { id, color } of PRODUCTS) {
		const rgb = [1, 3, 5].map((i) => Number.parseInt(color.slice(i, i + 2), 16));
		tokens[`product-${id}`] = color;
		tokens[`product-${id}-soft`] = `rgb(${rgb.join(" ")} / 0.10)`;
		tokens[`product-${id}-hairline`] = `rgb(${rgb.join(" ")} / 0.30)`;
	}
	return tokens;
}
