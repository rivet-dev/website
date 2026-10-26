import {
	faBookOpen,
	faBuilding,
	faBuildingLock,
	faCloud,
	faCode,
	faCompass,
	faGrid2,
	faServer,
	faSparkles,
	faUser,
	faUsers,
} from "@rivet-gg/icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { ACTOR_REGISTRY_LINK, ACTOR_TYPES } from "./actor-types";

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
	/** One line, no terminal period. Kept short enough not to wrap. */
	description: string;
	icon: IconDefinition;
	/** The guide on the Guides tab that shows how to build this. */
	href: string;
}

/**
 * Each row opens the matching guide. Audiences without a written guide yet
 * point at a website-owned placeholder in `src/content/guides`, listed in
 * `src/sitemap/site-guides.ts`.
 */
export const SOLUTIONS_MENU: SolutionMenuItem[] = [
	{
		id: "coding-agents",
		href: "/guides/build-coding-agent/",
		label: "Coding agents",
		description: "A sandbox and durable memory per session",
		icon: faCode,
	},
	{
		id: "agent-app-builders",
		href: "/guides/host-ai-generated-apps/",
		label: "Agent app builders",
		description: "A backend per user, deployed on generation",
		icon: faSparkles,
	},
	{
		id: "company-agents",
		href: "/guides/deploy-ai-agent/",
		label: "Company-specific agents",
		description: "Agents on internal data, inside your network",
		icon: faBuilding,
	},
	{
		id: "personal-agents",
		href: "/guides/personal-agent/",
		label: "Personal agents",
		description: "One long-lived Actor per user",
		icon: faUser,
	},
	{
		id: "realtime-apps",
		href: "/guides/chat-room/",
		label: "Realtime apps",
		description: "Multiplayer state over WebSockets",
		icon: faUsers,
	},
];

/** Footer link under the Solutions grid. */
export const SOLUTIONS_MENU_FOOTER = {
	label: "Browse all guides",
	href: "/guides/",
};

export interface DocsMenuLink {
	label: string;
	href: string;
	/**
	 * Product whose wordmark tile this row carries, via `ProductBadge`. Rows
	 * without one take `icon` in a quiet outlined tile of the same size.
	 */
	productId?:
		| "actors"
		| "agents"
		| "workflows"
		| "agentos"
		| "dynamic-apps"
		| "integrations";
	icon?: IconDefinition;
}

export interface DocsMenuGroup {
	/** Eyebrow over the rows. */
	label: string;
	links: DocsMenuLink[];
}

/** One column of the menu; its groups stack top to bottom. */
export type DocsMenuColumn = DocsMenuGroup[];

/**
 * The Documentation menu, in two columns: what runs the workloads (the
 * orchestration docs and where to deploy, one flat list), and the workloads
 * themselves.
 * Mirrors the docs tab strip (`src/sitemap/docsTabs.ts`); the actor types
 * come from `src/data/actor-types.ts`, the same list the homepage's "there's
 * an actor for it" section renders.
 */
export const DOCS_MENU: DocsMenuColumn[] = [
	[
		{
			label: "Orchestration",
			links: [
				{ label: "Overview", href: "/docs/", icon: faBookOpen },
				{ label: "Guides", href: "/guides/", icon: faCompass },
				{ label: "Self-Host", href: "/docs/deploy/self-host/control-plane/", icon: faServer },
				{ label: "BYOC", href: "/docs/deploy/byoc/", icon: faBuildingLock },
				{ label: "Cloud", href: "/docs/deploy/cloud/", icon: faCloud },
			],
		},
	],
	[
		{
			label: "Actors",
			links: [
				// Secure Exec is a library with its own subsite, so it stays out of
				// this menu; the footer's Libraries group lists it.
				...ACTOR_TYPES.map((type) => ({
					label: type.name,
					href: type.href,
					productId: type.id,
				})),
				{ ...ACTOR_REGISTRY_LINK, icon: faGrid2 },
			],
		},
	],
];
