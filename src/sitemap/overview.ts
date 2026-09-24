import type { SidebarItem } from "@/lib/sitemap";
import { siteDocsSidebar } from "./products";

/**
 * Sidebar for the product-agnostic docs at `/docs/`. These pages ship from the
 * Actors repo's `docs/general` bundle, so the sidebar is authored there in
 * `docs/general/sidebar.json` like any other bundle's.
 */
export const overviewSidebar: SidebarItem[] = siteDocsSidebar();
