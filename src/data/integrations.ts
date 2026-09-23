import { faSquareInfo } from "@rivet-gg/icons";
import type { SidebarItem } from "@/lib/sitemap";
import type { SeoOverrides } from "@/lib/seo";
import { integrationsHref } from "@/sitemap/integrations";

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
	/** Slug under the product's integrations route (see `integrationsHref`). */
	slug: string;
	category: string;
	icon: { src: string };
	badge?: string;
	exampleUrl?: string;
	sourceUrl: string;
}

const ACTORS: Integration[] = [
	{
		title: "Flue",
		description: "Run Flue agents on Rivet with agentOS sandboxes.",
		slug: "flue",
		category: "Agents",
		icon: { src: "/images/vendors/flue.svg" },
		badge: "Beta",
		exampleUrl: "https://github.com/rivet-dev/agentos/tree/main/examples/flue",
		sourceUrl: "https://github.com/rivet-dev/agentos/tree/main/packages/flue",
	},
	{
		title: "Vercel Eve",
		description: "Use Rivet as the durable World for Vercel Eve.",
		slug: "vercel-eve",
		category: "Agents",
		icon: { src: "/images/vendors/eve.svg" },
		badge: "Beta",
		exampleUrl:
			"https://github.com/rivet-dev/agentos/tree/main/examples/vercel-eve",
		sourceUrl: "https://github.com/rivet-dev/agentos/tree/main/packages/eve",
	},
	{
		title: "Workflow SDK",
		description: "Vercel's Workflow SDK backed by Rivet Actors.",
		slug: "workflow-sdk",
		category: "Workflows",
		icon: { src: "/images/vendors/workflow.svg" },
		badge: "Beta",
		exampleUrl:
			"https://github.com/rivet-dev/rivet/tree/main/examples/workflow-sdk",
		sourceUrl:
			"https://github.com/rivet-dev/rivet/tree/main/integrations/workflow-world",
	},
	{
		title: "Durable Streams",
		description:
			"Real-time streams with durable, replayable history, backed by Rivet Actors.",
		slug: "durable-streams",
		category: "Streams",
		icon: { src: "/images/vendors/durable-streams.svg" },
		sourceUrl: "https://github.com/rivet-dev/rivet-durable-streams",
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
		exampleUrl: "https://github.com/rivet-dev/agentos/tree/main/examples/flue",
		sourceUrl: "https://github.com/rivet-dev/agentos/tree/main/packages/flue",
	},
	{
		title: "Vercel Eve",
		description: "Use agentOS as the execution layer for Vercel Eve.",
		slug: "vercel-eve",
		category: "Frameworks",
		icon: { src: "/images/vendors/eve.svg" },
		badge: "Beta",
		exampleUrl:
			"https://github.com/rivet-dev/agentos/tree/main/examples/vercel-eve",
		sourceUrl: "https://github.com/rivet-dev/agentos/tree/main/packages/eve",
	},
	{
		title: "Rivet Actors",
		description: "Run agentOS on Rivet Actors for persistence and scheduling.",
		slug: "rivet-actors",
		category: "Platform",
		icon: { src: "/images/vendors/rivet.svg" },
		exampleUrl:
			"https://github.com/rivet-dev/agentos/tree/main/examples/quickstart-app",
		sourceUrl:
			"https://github.com/rivet-dev/agentos/tree/main/packages/agentos",
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

export function integrationFor(
	productId: string,
	slug: string,
): Integration | undefined {
	return integrationsFor(productId).find(
		(integration) => integration.slug === slug,
	);
}

export interface IntegrationGroup {
	title: string;
	items: Integration[];
}

/**
 * A product's integrations grouped by category, in first-seen order. Both the
 * Integrations sidebar and the overview page render from this, so they always
 * show the same sections in the same order.
 */
export function integrationGroups(productId: string): IntegrationGroup[] {
	const groups: IntegrationGroup[] = [];
	for (const item of integrationsFor(productId)) {
		const group = groups.find((g) => g.title === item.category);
		if (group) group.items.push(item);
		else groups.push({ title: item.category, items: [item] });
	}
	return groups;
}

/**
 * Integrations sidebar for a product: an Overview entry, then one section per
 * category in first-seen order.
 */
export function integrationSidebar(productId: string): SidebarItem[] {
	const groups = integrationGroups(productId);
	if (groups.length === 0) return [];

	return [
		{
			title: "General",
			pages: [
				{
					title: "Overview",
					href: integrationsHref(productId),
					icon: faSquareInfo,
				},
			],
		},
		...groups.map((group) => ({
			title: group.title,
			pages: group.items.map(({ title, slug, icon, badge }) => ({
				title,
				href: integrationsHref(productId, slug),
				icon,
				badge,
			})),
		})),
	] satisfies SidebarItem[];
}
