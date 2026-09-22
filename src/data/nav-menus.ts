import {
	faSparkles,
	faUsers,
	faBuilding,
	faUser,
	faCode,
} from "@rivet-gg/icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

/**
 * The two header menus.
 *
 * Solutions mirrors the landing page's "Built for every kind of agent" list,
 * and Documentation lists the actor types people reach for most. Both live here
 * rather than in the header so the menu and the page section they echo cannot
 * drift apart.
 */

export interface SolutionMenuItem {
	id: string;
	label: string;
	description: string;
	icon: IconDefinition;
}

/**
 * Deliberately hrefless. These are the audiences the landing section names;
 * the pages behind them do not exist yet, so the menu states the shape of the
 * offering without promising destinations it cannot honor.
 */
export const SOLUTIONS_MENU: SolutionMenuItem[] = [
	{
		id: "coding-agents",
		label: "Coding agents",
		description: "Give each session a sandbox, a filesystem, and durable memory",
		icon: faCode,
	},
	{
		id: "agent-app-builders",
		label: "Agent app builders",
		description: "Ship a backend per user the moment the agent generates one",
		icon: faSparkles,
	},
	{
		id: "company-agents",
		label: "Company-specific agents",
		description: "Run agents against internal data, inside your own network",
		icon: faBuilding,
	},
	{
		id: "personal-agents",
		label: "Personal agents",
		description: "One long-lived actor per user, awake only when addressed",
		icon: faUser,
	},
	{
		id: "realtime-apps",
		label: "Realtime apps",
		description: "Multiplayer state over WebSockets with no broker in between",
		icon: faUsers,
	},
];

export interface DocsMenuLink {
	label: string;
	href: string;
	/**
	 * Product whose wordmark tile this row carries, via `ProductBadge`. Rows
	 * without one render as plain text links.
	 */
	productId?: "actors" | "agentos" | "workflows" | "dynamic-apps";
}

export interface DocsMenuColumn {
	label: string;
	links: DocsMenuLink[];
}

/**
 * The Documentation menu, in two columns: what runs the workloads, and the
 * workloads themselves.
 */
export const DOCS_MENU: DocsMenuColumn[] = [
	{
		label: "Orchestration",
		links: [
			{ label: "Tutorials", href: "/orchestration/tutorials/" },
			{ label: "Deploy", href: "/orchestration/deploy/" },
		],
	},
	{
		label: "Actors",
		links: [
			{ label: "Agents", href: "/registry/agent-actor/", productId: "actors" },
			{ label: "Workflows", href: "/workflows/docs/", productId: "workflows" },
			{ label: "agentOS", href: "/agentos/docs/", productId: "agentos" },
			{
				label: "Dynamic Apps",
				href: "/dynamic-apps/docs/",
				productId: "dynamic-apps",
			},
			{ label: "Build your own actor", href: "/actors/docs/" },
			{ label: "View all actors", href: "/registry/" },
		],
	},
];
