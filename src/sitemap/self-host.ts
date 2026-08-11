import { faSquareInfo, faClipboardListCheck, faSliders, faServer } from "@rivet-gg/icons";
import type { SidebarItem } from "@/lib/sitemap";
import {
	CONTROL_PLANE_PAGES,
	platformSupport,
	platformsFor,
} from "./deployMatrix";

const REFERENCE_PAGES = new Set([
	"configuration",
	"ports",
	"storage",
	"tls",
	"multi-region",
	"upgrades",
	"backups",
]);

const PAGE_TITLES: Record<string, string> = {
	configuration: "Configuration",
	ports: "Ports",
	storage: "Storage",
	tls: "TLS & Certificates",
	"multi-region": "Multi-Region",
	upgrades: "Upgrades",
	backups: "Backup & Restore",
};

/**
 * The Self-Host tab's sidebar, derived entirely from `deployMatrix`. All four
 * products get the same shape; only the platform lists differ.
 */
export function deploySidebar(productId: string): SidebarItem[] {
	const base = `/${productId}/self-host`;

	const platformPage = (role: "worker" | "control-plane") =>
		platformsFor(productId, role).map((platform) => ({
			title: platform.shortTitle ?? platform.displayName,
			href: `${base}/${role === "worker" ? "workers" : "control-plane"}/${platform.slug}`,
			icon: platform.icon,
			badge:
				platformSupport(productId, role, platform) === "recommended"
					? "Recommended"
					: undefined,
		}));

	return [
		{
			title: "General",
			pages: [
				{
					title: "Overview",
					href: base,
					icon: faSquareInfo,
				},
			],
		},
		{
			title: "Workers",
			pages: [
				{
					title: "Overview",
					href: `${base}/workers`,
					icon: faSquareInfo,
				},
				{
					title: "Production Checklist",
					href: `${base}/workers/production-checklist`,
					icon: faClipboardListCheck,
				},
				{
					title: "Platforms",
					icon: faServer,
					collapsible: true,
					pages: platformPage("worker"),
				},
			],
		},
		{
			title: "Control Plane",
			pages: [
				{
					title: "Overview",
					href: `${base}/control-plane`,
					icon: faSquareInfo,
				},
				{
					title: "Production Checklist",
					href: `${base}/control-plane/production-checklist`,
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
						href: `${base}/control-plane/${page}`,
					})),
				},
			],
		},
	];
}
