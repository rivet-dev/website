import type { ProductMotifId } from "@/components/marketing/ProductMotif";
import { getProduct, isListed } from "@/sitemap/products";

/**
 * The actor types, as the homepage lists them and the Documentation menu
 * repeats them.
 *
 * Actors is the primitive being orchestrated, so it is not an actor type and
 * has no entry here. Each type is a product: its title, badge, accent color,
 * wordmark, and docs landing come from `product-metadata.ts` through
 * `getProduct`, so this file only adds what the product record does not carry —
 * the ordering, the plate's premise line, and the hover motif it borrows.
 */
export interface ActorType {
	/** Product id; also the wordmark (`productLogos`) and, by default, the accent. */
	id: "actors" | "agents" | "workflows" | "sandboxes" | "dynamic-apps";
	/** Product whose accent the plate wears, when not its own. */
	accentId?: "agents";
	name: string;
	/** One line under the name on the homepage plate. No terminal period. */
	premise: string;
	/** Docs landing for the type. */
	href: string;
	/** Status badge, e.g. "Preview". */
	badge?: string;
	/** Hover motif the homepage plate borrows. */
	motifId: ProductMotifId;
}

const ORDERED: {
	id: ActorType["id"];
	premise: string;
	motifId: ProductMotifId;
	accentId?: ActorType["accentId"];
}[] = [
	{
		id: "agents",
		premise: "A durable process per agent, with memory that survives restarts",
		motifId: "actors",
	},
	{
		id: "workflows",
		premise: "Multi-step operations that replay instead of starting over",
		motifId: "workflows",
	},
	{
		// Sandboxes are agentOS as an API, so they borrow its motif and mark.
		id: "sandboxes",
		premise: "A filesystem, shell, and network for code you did not write",
		motifId: "agentos",
	},
	{
		id: "dynamic-apps",
		premise: "A backend per user, deployed the moment it is generated",
		motifId: "dynamic-apps",
	},
];

function resolve(entry: (typeof ORDERED)[number]): ActorType {
	const product = getProduct(entry.id);
	if (!product) throw new Error(`Actor type "${entry.id}" has no product`);
	return {
		...entry,
		name: product.name,
		href: product.href,
		badge: product.badge,
	};
}

/** The actor types as listed everywhere: unlaunched products are left out. */
export const ACTOR_TYPES: readonly ActorType[] = ORDERED.filter((entry) =>
	isListed(entry.id),
).map(resolve);

/**
 * The homepage plates. While Agents is unlaunched, the Actors primitive stands
 * in its slot wearing the Agents blue so the grid keeps its four colors.
 *
 * TEMPORARY: once Agents launches (drop `unlaunched` in product-metadata.ts),
 * delete the stand-in so this is `ACTOR_TYPES` again.
 */
export const HOMEPAGE_ACTOR_PLATES: readonly ActorType[] = ORDERED.map((entry) =>
	entry.id === "agents" && !isListed("agents")
		? {
				id: "actors" as const,
				// The product's own premise line, so the copy has one home.
				premise: getProduct("actors")?.premise ?? "",
				motifId: "actors" as const,
				accentId: "agents" as const,
			}
		: entry,
)
	.filter((entry) => isListed(entry.id))
	.map(resolve);

/**
 * The two ways past the list, shown after the actor types wherever they are
 * listed: the registry for actors Rivet does not maintain, and the Actors docs
 * for writing one.
 */
export const ACTOR_WAYFINDERS = {
	explore: { label: "Explore more Actors", href: "/registry/" },
	build: { label: "Build your own Actor", href: "/actors/docs/" },
} as const;
