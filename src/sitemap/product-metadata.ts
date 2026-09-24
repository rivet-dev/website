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
	 * Tabs beyond the ones every product has (Use Cases, Documentation). A
	 * product without the content for one simply does not show the tab. Guides
	 * and Deploy are site-wide sections (`/guides/`, `/docs/deploy/`), not
	 * product tabs.
	 */
	optionalTabs: ("integrations" | "registry")[];
	/**
	 * Restricts the tab set. Omit for the standard set.
	 */
	tabs?: ("overview" | "use-cases" | "docs" | "integrations" | "registry")[];
	/**
	 * Tabs that still build but are not shown in the nav.
	 *
	 * Distinct from omitting them from `tabs`: those routes disappear, which
	 * breaks every inbound link and redirect pointing at them. A hidden tab keeps
	 * its pages reachable by URL while the section is unfinished. Track these in
	 * HIDDEN.md.
	 */
	hiddenTabs?: ("use-cases" | "integrations" | "registry")[];
	/**
	 * Kept out of the product switcher and the /docs index. The vertical still
	 * builds and is linked from its own pages; it is just not one of the pillars.
	 */
	hidden?: boolean;
	/**
	 * Kept out of the Products menu only. Unlike `hidden`, the product still
	 * appears in the `/docs` index, the footer, and anywhere else products are
	 * listed — it is simply not offered as one of the pillars to switch to.
	 */
	hiddenFromSwitcher?: boolean;
	/**
	 * Built and routed, but not launched: dropped from every listing (the
	 * homepage actor types, the docs tab strip, the Documentation menu, the
	 * footer, the registry) until it is. Stronger than `hidden`, which only
	 * keeps a product out of the switcher and the docs index. Track in HIDDEN.md.
	 */
	unlaunched?: true;
	/** Short status chip shown next to the name, e.g. "Preview". */
	badge?: string;
	/**
	 * A subsite with its own marketing page and its own second header row
	 * (Overview plus the product's tabs), rather than the shared docs tab strip.
	 * agentOS and Secure Exec are documented as products in their own right, so
	 * they are not folded into the orchestration docs.
	 */
	standalone?: true;
	/**
	 * A docs section shared across the verticals rather than a vertical of its
	 * own. It carries a name, mark, and accent so it can ride in the docs tab
	 * strip and the Documentation menu like the actor types, but it owns no
	 * content bundle and generates no routes: its pages live under each
	 * product (`/integrations/`). `landing` is where its link goes.
	 */
	section?: true;
	/** Where the product link lands, for sections without routes of their own. */
	landing?: string;
	/**
	 * Bundle path inside this repo, relative to the repo root, for products whose
	 * docs are not owned by a sibling repository. Shaped exactly like a product
	 * repo (`<bundle>/docs/sidebar.json`, `<bundle>/docs/content/**`) so moving
	 * these docs out later is a delete plus a checkout.
	 */
	localBundle?: string;
	/**
	 * Bundle directory inside the product's repo, when it is not `docs/`. Secure
	 * Exec ships from the agentOS repo at `secure-exec/docs`, and its snippets
	 * resolve against that repo's root. The vendored CI copy is always `docs/`.
	 */
	bundlePath?: string;
	/**
	 * Id of the product whose docs bundle this one renders, re-rooted under its
	 * own routes (planned: Sandboxes serving the agentOS bundle at
	 * `/sandboxes/docs/`). The content, sidebar, and edit links all come from
	 * that product's source, so `repo` must name the same repository.
	 */
	bundleOf?: string;
	/**
	 * Where the Documentation tab points when this product's docs are served
	 * under another product (Sandboxes -> `/agentos/docs/`). The tab then owns
	 * no sidebar and generates no routes of its own.
	 */
	docsHome?: string;
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
		// One of three bundles in that repo, beside `docs/general` (the
		// product-agnostic docs at /docs/) and `docs/integrations`.
		bundlePath: "docs/actors",
		// Neutral graphite rather than a hue: Actors is the primitive under every
		// other product, so it takes no color of its own. Reads on porcelain
		// (5.7:1) and, lightened, on the dark theme.
		color: "#5B5D63",
		contrast: 5.72,
		optionalTabs: ["integrations"],
		hiddenTabs: ["use-cases"],
	},
	{
		// Agents are Actors with a particular shape rather than a separate
		// library, so their docs are thin and website-owned: an overview that
		// points into the Actors docs and guides. Shaped like a product bundle so
		// the docs can move to a repo of their own later.
		id: "agents",
		name: "Agents",
		tagline: "A durable process per agent, with memory that survives restarts",
		repo: "rivet-website",
		localBundle: "agents",
		color: "#2C5A7A",
		contrast: 6.41,
		optionalTabs: [],
		tabs: ["docs"],
		hidden: true,
		// TEMPORARY: not launched yet. Everything is built and `/agents/docs/`
		// still resolves; drop this line to list Agents again everywhere.
		unlaunched: true,
	},
	{
		// Sandboxes are agentOS as an API: the actor type that hosts it. They
		// share its mark and accent. Their docs are the agentOS docs for now, so
		// the Documentation tab lands there and this product routes nothing.
		// TEMPORARY: the plan is to move the agentOS docs bundle here
		// (`bundleOf: "agentos"`, `/sandboxes/docs/`) once agentOS is a pure
		// library like Secure Exec; see HIDDEN.md.
		id: "sandboxes",
		name: "Sandboxes",
		tagline: "A filesystem, shell, and network for code you did not write",
		repo: "agentos",
		color: "#9C3A3F",
		contrast: 5.91,
		optionalTabs: [],
		tabs: ["docs"],
		docsHome: "/agentos/docs/",
		hidden: true,
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
		// Keeps its (hidden, still routed) Use Cases page.
		tabs: ["overview", "use-cases", "docs", "integrations", "registry"],
		hiddenTabs: ["use-cases"],
		standalone: true,
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
		optionalTabs: [],
		hiddenTabs: ["use-cases"],
	},
	{
		id: "dynamic-apps",
		name: "Dynamic Apps",
		badge: "Preview",
		tagline: "Deploy an AI-generated backend for every user",
		verb: "Deploy",
		premise: "Deploy AI-generated apps for your users",
		repo: "dynamic-apps",
		color: "#2F6B4B",
		contrast: 5.49,
		optionalTabs: [],
		hiddenTabs: ["use-cases"],
	},
	{
		// Third-party frameworks and SDKs that run on the actor types. A shared
		// docs section rather than a vertical: it owns its bundle but renders at
		// the site root (`/integrations/`) rather than under a product, and its
		// sidebar is built from src/data/integrations.ts so it can carry vendor
		// logos and category groups. Listed here so it takes a mark and a gray
		// tile beside the actor types in the docs tab strip.
		id: "integrations",
		name: "Integrations",
		tagline: "Third-party frameworks and SDKs backed by Rivet Actors",
		repo: "rivet",
		bundlePath: "docs/integrations",
		// Neutral gray, a step lighter than Actors' graphite so the two tiles
		// read apart. White glyph at 5.1:1; lightened on the dark theme.
		color: "#6B6E75",
		contrast: 4.44,
		optionalTabs: [],
		tabs: [],
		section: true,
		landing: "/integrations/",
		hidden: true,
	},
	{
		// Not a product vertical: its bundle (`cloud/docs/`) renders inside the
		// Deploy section at /docs/deploy/{cloud,byoc}/ (see ./deploy.ts),
		// and its marketing page is /pricing/.
		id: "cloud",
		name: "Rivet Cloud",
		tagline: "Managed Rivet, deployed and operated for you",
		repo: "rivet-website",
		localBundle: "cloud",
		color: "#8A5A2B",
		contrast: 5.72,
		optionalTabs: [],
		tabs: [],
		landing: "/pricing/",
		hidden: true,
	},
	{
		// The isolate runtime underneath agentOS, moved here from secureexec.dev.
		// A library rather than a pillar, so it stays out of the switcher. It
		// ships from the agentOS repo, where its docs and examples sit together
		// under `secure-exec/`.
		id: "secure-exec",
		name: "Secure Exec",
		tagline: "Secure Node.js execution without a sandbox",
		repo: "agentos",
		bundlePath: "secure-exec/docs",
		// Ink rather than a hue: the black-and-white gothic wordmark is the
		// brand, ported from secureexec.dev's dark design. Lightened on the dark
		// theme like every other product color.
		color: "#1B1916",
		contrast: 15.25,
		optionalTabs: [],
		tabs: ["overview", "docs"],
		hiddenFromSwitcher: true,
		standalone: true,
	},
];

export const PRODUCT_IDS = PRODUCTS.map((product) => product.id);

/**
 * Whether a product has a docs bundle of its own to assemble and read a
 * sidebar from. Shared sections (Integrations) have none, nor does a product
 * whose only tab links out to another product's docs (Sandboxes -> agentOS).
 */
export function ownsDocsBundle(product: ProductMetadata): boolean {
	// A shared section owns a bundle only when it says where that bundle is.
	// Integrations does; its pages render at `/integrations/` rather than under
	// a product vertical, but they are still authored in a product repo.
	if (product.section) return Boolean(product.bundlePath ?? product.localBundle);
	if (product.docsHome && (product.tabs ?? []).every((tab) => tab === "docs")) return false;
	return true;
}

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
		const rgb = [1, 3, 5].map((i) =>
			Number.parseInt(color.slice(i, i + 2), 16),
		);
		tokens[`product-${id}`] = color;
		tokens[`product-${id}-soft`] = `rgb(${rgb.join(" ")} / 0.10)`;
		tokens[`product-${id}-hairline`] = `rgb(${rgb.join(" ")} / 0.30)`;
	}
	return tokens;
}
