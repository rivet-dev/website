/**
 * Open Graph preview cards.
 *
 * One entry per card. `scripts/render-og-images.ts` renders every entry to
 * `public/images/og/<id>.png` (run `pnpm render:og` after editing copy), and
 * pages point at a card with `ogImageFor(id)` / `productOgImage(productId)`.
 * Keep the copy here in step with the page it previews: the site-wide card
 * mirrors the homepage hero, product cards mirror `product-metadata.ts`.
 *
 * Kept free of Vite-only imports so the renderer can load it under plain tsx.
 */
import { PRODUCTS, getProductMetadata } from "@/sitemap/product-metadata";

export const OG_IMAGE_WIDTH = 2400;
export const OG_IMAGE_HEIGHT = 1260;

export interface OgCard {
	/** File stem under `public/images/og/`. */
	id: string;
	headline: string;
	supporting: string;
	/**
	 * Product whose mark and name replace the Rivet lockup in the top-left.
	 * Resolved to `public/images/brand/<id>-mark.svg` and the product accent.
	 */
	productId?: string;
	/**
	 * Classical artwork on the right half. Only the site-wide card carries one.
	 * `src` is a path under `public/`; the figure is a transparent cutout that
	 * stands on the porcelain field like the talk-to-an-engineer hero, not a
	 * framed photo.
	 */
	art?: {
		src: string;
		alt: string;
	};
}

const THINKER = {
	src: "/images/thinking/the-thinker.webp",
	alt: "The Thinker by Auguste Rodin",
};

function product(id: string) {
	const meta = getProductMetadata(id);
	if (!meta) throw new Error(`Unknown product for OG card: ${id}`);
	return meta;
}

export const OG_CARDS: OgCard[] = [
	{
		id: "default",
		headline: "The orchestrator for agentic workloads.",
		supporting:
			"Run agents, workflows, and sandboxes as durable Actors. Open-source and self-hostable.",
		art: THINKER,
	},
	{
		id: "actors",
		productId: "actors",
		headline: product("actors").tagline,
		supporting:
			"Addressable, long-running processes with SQLite per Actor, WebSockets, and hibernation.",
	},
	{
		id: "agentos",
		productId: "agentos",
		headline: product("agentos").tagline,
		supporting:
			"A virtual operating system for agents, with files, processes, shell, and networking in one lightweight library.",
	},
	{
		id: "workflows",
		productId: "workflows",
		headline: product("workflows").tagline,
		supporting:
			"Write multi-step operations that survive restarts, with steps, timers, and queue waits inside one runtime.",
	},
	{
		id: "dynamic-apps",
		productId: "dynamic-apps",
		headline: product("dynamic-apps").tagline,
		supporting:
			"Hosting for AI-generated apps, built on Rivet Actors and deployed per user.",
	},
	{
		id: "cloud",
		productId: "cloud",
		headline: product("cloud").tagline,
		supporting:
			"Run Rivet on our managed cloud, inside your own VPC, or on an air-gapped network.",
	},
	{
		id: "secure-exec",
		productId: "secure-exec",
		headline: product("secure-exec").tagline,
		supporting:
			"Run untrusted, npm-compatible Node.js in V8 isolates. The runtime underneath agentOS.",
	},
	{
		id: "docs",
		headline: "Rivet documentation",
		supporting:
			"Guides, references, and deployment docs for Actors, agentOS, Workflows, and Dynamic Apps.",
	},
	{
		id: "deploy",
		headline: "Deploy Rivet anywhere.",
		supporting:
			"Rivet Cloud, bring your own cloud, or self-host the control plane on Kubernetes.",
	},
	{
		id: "guides",
		headline: "Rivet guides",
		supporting:
			"Step-by-step tutorials for building agents, real-time apps, and durable backends on Rivet Actors.",
	},
	{
		id: "integrations",
		headline: "Integrations",
		supporting:
			"Third-party frameworks, SDKs, and tools backed by Rivet Actors.",
	},
	{
		id: "registry",
		headline: "Actor registry",
		supporting:
			"Browse the Actor types that run on Rivet: agents, workflows, sandboxes, dynamic apps, and the frameworks built on them.",
	},
	{
		id: "blog",
		headline: "Rivet engineering blog",
		supporting:
			"Engineering deep dives, product launches, and changelog notes from the team building Rivet.",
	},
	{
		id: "enterprise",
		headline: "Enterprise infrastructure",
		supporting:
			"Bring Rivet inside your boundary: BYOC, air-gapped and sovereign-cloud deployments, priority support, and SLAs.",
	},
	{
		id: "startups",
		headline: "50% off Rivet Cloud for YC and a16z Speedrun companies.",
		supporting:
			"Twelve months of discounted pricing and an architecture review with the Rivet team.",
	},
	{
		id: "talk-to-an-engineer",
		headline: "Talk to an engineer.",
		supporting:
			"Walk through your stack and deployment model with someone who builds Rivet.",
	},
	{
		id: "support",
		headline: "Rivet support",
		supporting:
			"Get help via email, the Discord community, or the documentation.",
	},
	{
		id: "brand",
		headline: "Rivet brand kit",
		supporting:
			"Logos, product marks, colors, and typography for docs, decks, and articles.",
	},
];

const CARD_IDS = new Set(OG_CARDS.map((card) => card.id));

/** Site-relative URL of a rendered card. BaseLayout makes it absolute. */
export function ogImageFor(id: string): string {
	if (!CARD_IDS.has(id)) throw new Error(`No OG card "${id}"; add it to src/lib/ogImage.ts`);
	return `/images/og/${id}.png`;
}

/**
 * The card for a product vertical's pages, falling back to the docs card for
 * products without one (Agents, Sandboxes, Integrations) and to the site-wide
 * card when no product is set.
 */
export function productOgImage(productId: string | undefined): string {
	if (!productId) return ogImageFor("default");
	if (CARD_IDS.has(productId) && PRODUCTS.some((p) => p.id === productId)) {
		return ogImageFor(productId);
	}
	return ogImageFor("docs");
}

/**
 * The `/secure-exec/` overview keeps the dark card ported from secureexec.dev
 * to match its dark page design; its docs use the light product card above.
 * Committed at 1280x630, so the page must pass these dimensions through.
 */
export const SECURE_EXEC_OVERVIEW_OG_IMAGE = {
	src: "/images/secure-exec/og.png",
	width: 1280,
	height: 630,
} as const;
