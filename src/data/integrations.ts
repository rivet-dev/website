import { faSquareInfo } from "@rivet-gg/icons";
import type { SidebarItem } from "@/lib/sitemap";
import type { SeoOverrides } from "@/lib/seo";

/**
 * Integrations, per product.
 *
 * `products.ts` builds the Integrations sidebar from this instead of from the
 * bundle, which is what restores the category grouping and the logos.
 *
 * Logos are `public/` paths, not Vite imports: `products.ts` is loaded by
 * `scripts/check-sitemap.ts` under bare tsx, which cannot resolve an `.svg`
 * import.
 */
export interface Integration extends SeoOverrides {
	title: string;
	description: string;
	/** Slug under `/{product}/integrations/`. */
	slug: string;
	category: string;
	icon: { src: string };
	badge?: string;
}

const ACTORS: Integration[] = [
	{
		title: "Flue",
		description: "Run Flue agents on Rivet with agentOS sandboxes.",
		slug: "flue",
		category: "Agents",
		icon: { src: "/images/vendors/flue.svg" },
		badge: "Beta",
	},
	{
		title: "Vercel Eve",
		description: "Use Rivet as the durable World for Vercel Eve.",
		slug: "vercel-eve",
		category: "Agents",
		icon: { src: "/images/vendors/eve.svg" },
		badge: "Beta",
	},
	{
		title: "Workflow SDK",
		description: "Vercel's Workflow SDK backed by Rivet Actors.",
		slug: "workflow-sdk",
		category: "Workflows",
		icon: { src: "/images/vendors/workflow.svg" },
		badge: "Beta",
	},
	{
		title: "Durable Streams",
		description: "Real-time streams with durable, replayable history, backed by Rivet Actors.",
		slug: "durable-streams",
		category: "Streams",
		icon: { src: "/images/vendors/durable-streams.svg" },
	},
];

const AGENTOS: Integration[] = [
	{
		title: "Flue",
		description: "Run Flue agents inside agentOS sandboxes.",
		slug: "flue",
		category: "Frameworks",
		icon: { src: "/images/vendors/flue.svg" },
		badge: "Beta",
	},
	{
		title: "Vercel Eve",
		description: "Use agentOS as the execution layer for Vercel Eve.",
		slug: "vercel-eve",
		category: "Frameworks",
		icon: { src: "/images/vendors/eve.svg" },
		badge: "Beta",
	},
	{
		title: "Rivet Actors",
		description: "Run agentOS on Rivet Actors for persistence and scheduling.",
		slug: "rivet-actors",
		category: "Platform",
		icon: { src: "/images/vendors/rivet.svg" },
	},
];

export const INTEGRATIONS: Record<string, Integration[]> = {
	actors: ACTORS,
	agentos: AGENTOS,
};

/** Cards on a product's Integrations overview page. */
export function integrationsFor(productId: string): Integration[] {
	return INTEGRATIONS[productId] ?? [];
}

/**
 * Integrations sidebar for a product: an Overview entry, then one section per
 * category in first-seen order.
 */
export function integrationSidebar(productId: string): SidebarItem[] {
	const items = integrationsFor(productId);
	if (items.length === 0) return [];

	const categories: string[] = [];
	for (const item of items) {
		if (!categories.includes(item.category)) categories.push(item.category);
	}

	return [
		{
			title: "General",
			pages: [
				{
					title: "Overview",
					href: `/${productId}/integrations/`,
					icon: faSquareInfo,
				},
			],
		},
		...categories.map((title) => ({
			title,
			pages: items
				.filter((item) => item.category === title)
				.map(({ title, slug, icon, badge }) => ({
					title,
					href: `/${productId}/integrations/${slug}/`,
					icon,
					badge,
				})),
		})),
	] satisfies SidebarItem[];
}
