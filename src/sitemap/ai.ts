import type { SidebarItem } from "@/lib/sitemap";

export const AI_DOCS_ITEMS = [
	{
		id: "skills",
		title: "Skills",
		href: "/actors/docs/general/skill/",
		contentId: "actors/docs/general/skill",
		markdownPath: "actors/docs/general/skill",
		editUrl:
			"https://github.com/rivet-dev/rivet/edit/main/docs/content/docs/general/skill.mdx",
		description:
			"Install Rivet guidance and implementation patterns in supported AI coding assistants.",
	},
	{
		id: "mcp",
		title: "MCP",
		href: "/docs/mcp/",
		contentId: "docs/mcp",
		markdownPath: "docs/mcp",
		editUrl:
			"https://github.com/rivet-dev/website/edit/main/src/content/docs/docs/mcp.mdx",
		description:
			"Connect Claude Code, Codex, Cursor, and other AI clients to Rivet.",
	},
] as const;

export type AiDocsItem = (typeof AI_DOCS_ITEMS)[number];

/**
 * Keep shared AI documentation inside the current product's docs shell. Actors
 * owns the canonical Skills page and is the default shell for the canonical MCP
 * page; every other product gets a noncanonical contextual alias.
 */
export function aiDocsHref(item: AiDocsItem, productId?: string): string {
	if (!productId || productId === "actors") return item.href;
	return `/${productId}/docs/ai/${item.id}/`;
}

export function aiSidebarSection(productId?: string): SidebarItem {
	return {
		title: "AI Tools",
		pages: AI_DOCS_ITEMS.map((item) => ({
			title: item.title,
			href: aiDocsHref(item, productId),
		})),
	};
}

/**
 * Add the site-wide AI links to a rendered Documentation sidebar without
 * making those links part of every product's route-owning sitemap.
 */
export function withAiSidebarSection(
	sidebar: readonly SidebarItem[],
	productId?: string,
): SidebarItem[] {
	const normalized = sidebar
		.filter((item) => item.title !== "AI" && item.title !== "AI Tools")
		.map((item) => {
			if (!("pages" in item)) return item;
			return {
				...item,
				pages: item.pages.filter(
					(page) => !("title" in page) || page.title !== "AI Integration",
				),
			};
		});
	const referenceIndex = normalized.findIndex(
		(item) => item.title === "Reference",
	);
	const insertAt = referenceIndex === -1 ? normalized.length : referenceIndex;

	return [
		...normalized.slice(0, insertAt),
		aiSidebarSection(productId),
		...normalized.slice(insertAt),
	];
}
