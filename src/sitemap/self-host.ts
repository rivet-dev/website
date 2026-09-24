import {
	faSquareInfo,
	faClipboardListCheck,
	faSliders,
	faServer,
} from "@rivet-gg/icons";
import type { SidebarItem } from "@/lib/sitemap";
import { CONTROL_PLANE_PAGES, platformsFor } from "./deployMatrix";
import { DEPLOY_ROUTE_PREFIX, SELF_HOST_ROUTE_PREFIX } from "./deploy";

const REFERENCE_PAGES = new Set([
	"configuration",
	"rbac",
	"ports",
	"storage",
	"tls",
	"multi-region",
	"upgrades",
	"backups",
]);

const PAGE_TITLES: Record<string, string> = {
	configuration: "Configuration",
	rbac: "RBAC",
	ports: "Ports",
	storage: "Storage",
	tls: "TLS & Certificates",
	"multi-region": "Multi-Region",
	upgrades: "Upgrades",
	backups: "Backup & Restore",
};

const platformPage = (role: "worker" | "control-plane") =>
	platformsFor(role).map((platform) => ({
		title: platform.shortTitle ?? platform.displayName,
		href: `${SELF_HOST_ROUTE_PREFIX}/${role === "worker" ? "workers" : "control-plane"}/${platform.slug}/`,
		icon: platform.icon,
	}));

/**
 * The website-owned groups of the Deploy sidebar, shared by every product.
 * `deploySidebar()` in `./products.ts` interleaves them with the managed
 * options from the Rivet Cloud bundle (Cloud, BYOC) in the section's order:
 * overview, Cloud, Deploy Workers, BYOC, Self-Host.
 */

/** The section overview at the Deploy root. */
export function deployOverviewGroup(): SidebarItem {
	return {
		title: "Deploy",
		pages: [
			{
				title: "Overview",
				href: `${DEPLOY_ROUTE_PREFIX}/`,
				icon: faSquareInfo,
			},
		],
	};
}

/** Running workers: applies to every option, since workers are always yours. */
export function deployWorkersGroup(): SidebarItem {
	const base = `${SELF_HOST_ROUTE_PREFIX}/workers`;
	return {
		title: "Deploy Workers",
		pages: [
			{
				title: "Overview",
				href: `${base}/`,
				icon: faSquareInfo,
			},
			{
				title: "Production Checklist",
				href: `${base}/production-checklist/`,
				icon: faClipboardListCheck,
			},
			{
				title: "Platforms",
				icon: faServer,
				collapsible: true,
				pages: platformPage("worker"),
			},
			{
				title: "Reference",
				icon: faSliders,
				collapsible: true,
				pages: [
					{
						title: "Health Checks",
						href: `${base}/health-checks/`,
					},
					{
						title: "Metadata",
						href: `${base}/metadata/`,
					},
					{
						title: "Prometheus Metrics",
						href: `${base}/prometheus-metrics/`,
					},
				],
			},
		],
	};
}

/** Running the control plane yourself. */
export function selfHostGroup(): SidebarItem {
	const base = `${SELF_HOST_ROUTE_PREFIX}/control-plane`;
	return {
		title: "Self-Host",
		pages: [
			{
				title: "Overview",
				href: `${base}/`,
				icon: faSquareInfo,
			},
			{
				title: "Production Checklist",
				href: `${base}/production-checklist/`,
				icon: faClipboardListCheck,
			},
			{
				title: "Platforms",
				icon: faServer,
				collapsible: true,
				pages: platformPage("control-plane"),
			},
			{
				title: "Reference",
				icon: faSliders,
				collapsible: true,
				pages: CONTROL_PLANE_PAGES.filter((page) =>
					REFERENCE_PAGES.has(page),
				).map((page) => ({
					title: PAGE_TITLES[page] ?? page,
					href: `${base}/${page}/`,
					...(page === "rbac" ? { badge: "Enterprise" } : {}),
				})),
			},
		],
	};
}
