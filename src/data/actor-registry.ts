import type { RegistryCategory } from "@/components/marketing/registry/RegistryPageClient";
import type { RegistryIconName } from "./registry-icons";

/**
 * The Rivet Registry: actor types you can run on the orchestrator.
 *
 * Deliberately separate from `registry.ts`, which is the agentOS package
 * catalog. That one lists what you install *inside* an agent's environment;
 * this one lists what the control plane *schedules*. They share the storefront
 * components and nothing else, so the two taxonomies can move independently.
 */
export type ActorRegistryType = "first-party" | "integration";

export interface ActorRegistryEntry {
	slug: string;
	title: string;
	description: string;
	types: ActorRegistryType[];
	featured?: boolean;
	beta?: boolean;
	/** Brand mark, preferred where one exists. */
	image?: string;
	/** Fallback glyph for entries with no brand mark. */
	icon?: RegistryIconName;
	/**
	 * Product whose accent tile and wordmark this entry wears, so an actor type
	 * looks the same here as it does on the landing page.
	 */
	productId?: "actors" | "agents" | "agentos" | "workflows" | "sandboxes" | "dynamic-apps";
	/** Where the card's "Docs" link goes. */
	href: string;
}

export const ACTOR_REGISTRY_CATEGORIES: RegistryCategory[] = [
	{
		type: "first-party",
		label: "Actor types",
		description:
			"Maintained by Rivet. Each one is a ready-made Actor with its own SDK, lifecycle, and docs.",
	},
	{
		type: "integration",
		label: "Integrations",
		description:
			"Frameworks and libraries that run on Rivet Actors, built by us and by the community.",
	},
];

export const actorRegistry: ActorRegistryEntry[] = [
	{
		slug: "agent-actor",
		title: "Agents",
		description:
			"A durable process per agent, with memory that survives restarts.",
		types: ["first-party"],
		productId: "agents",
		href: "/agents/docs/",
	},
	{
		slug: "workflow-actor",
		title: "Workflows",
		description:
			"Multi-step operations that replay instead of starting over.",
		types: ["first-party"],
		productId: "workflows",
		href: "/workflows/docs/",
	},
	{
		slug: "sandbox-actor",
		title: "Sandboxes",
		description:
			"A filesystem, shell, and network for code you did not write.",
		types: ["first-party"],
		productId: "sandboxes",
		href: "/agentos/docs/",
	},
	{
		slug: "dynamic-app-actor",
		title: "Dynamic Apps",
		description: "A backend per user, deployed the moment it is generated.",
		types: ["first-party"],
		beta: true,
		productId: "dynamic-apps",
		href: "/dynamic-apps/docs/",
	},
	{
		slug: "durable-streams",
		title: "Durable Streams",
		description:
			"Realtime streams with durable, replayable history, backed by Rivet Actors.",
		types: ["integration"],
		image: "/images/vendors/durable-streams.svg",
		href: "https://github.com/rivet-dev/rivet-durable-streams",
	},
	{
		slug: "vercel-eve",
		title: "Vercel Eve",
		description: "Use Rivet as the durable World for Vercel Eve.",
		types: ["integration"],
		beta: true,
		image: "/images/vendors/eve.svg",
		href: "/integrations/vercel-eve/",
	},
	{
		slug: "workflow-sdk",
		title: "Vercel Workflow SDK",
		description: "Vercel's Workflow SDK backed by Rivet Actors.",
		types: ["integration"],
		beta: true,
		image: "/images/vendors/workflow.svg",
		href: "/integrations/workflow-sdk/",
	},
	{
		slug: "flue",
		title: "Flue",
		description: "Run Flue agents on Rivet with agentOS sandboxes.",
		types: ["integration"],
		beta: true,
		image: "/images/vendors/flue.svg",
		href: "/integrations/flue/",
	},
];
