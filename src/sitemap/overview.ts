import type { SidebarItem } from "@/lib/sitemap";

/**
 * Sidebar for the docs Overview at `/docs/`. Website-owned,
 * so it lives here rather than in a product bundle's `sidebar.json`. Every
 * other docs section is reached through the docs tab strip, so the sidebar
 * carries the overview page alone.
 */
export const overviewSidebar: SidebarItem[] = [
	{
		title: "General",
		pages: [{ title: "Overview", href: "/docs/" }],
	},
];
