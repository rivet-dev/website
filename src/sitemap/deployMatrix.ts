import {
	deployOptions,
	type DeployOption,
	type DeployRole,
	type DeploySupport,
} from "@rivetkit/shared-data";

export type { DeployRole, DeploySupport };

/**
 * Single source of truth for which self-host guides exist.
 *
 * Support is platform x role, and lives in `@rivetkit/shared-data` so the
 * `<Hosting>` component and this module cannot disagree. The guides are shared
 * by every product: agentOS included, because it runs inside actors and the
 * actor supplies the persistence, so the host platform never has to.
 *
 * Both `deployWorkersGroup()`/`selfHostGroup()` and the route's `getStaticPaths()` read from this.
 * If they diverge, the sidebar links to routes that were never generated, so
 * keep this the only place that answers "does this guide exist".
 */

export function platformSupport(
	role: DeployRole,
	option: DeployOption,
): DeploySupport {
	return option.support[role];
}

/** Platform guides that exist for this role, in registry order. */
export function platformsFor(role: DeployRole): DeployOption[] {
	return deployOptions.filter(
		(option) => platformSupport(role, option) !== "unsupported",
	);
}

/**
 * Non-platform pages in each section. Platform guides are appended after these
 * by the sidebar builder and the route.
 */
export const WORKER_PAGES = [
	"index",
	"production-checklist",
	"health-checks",
	"metadata",
	"prometheus-metrics",
] as const;

export const CONTROL_PLANE_PAGES = [
	"index",
	"configuration",
	"rbac",
	"ports",
	"storage",
	"tls",
	"multi-region",
	"upgrades",
	"backups",
	"production-checklist",
] as const;

export interface SelfHostGuide {
	/** Path under the section root, e.g. `workers/kubernetes`. */
	slug: string;
	role: DeployRole | null;
	/** Set when the guide is a platform guide. */
	platform?: DeployOption;
}

/** Every self-host guide that should exist, in sidebar order. */
export function selfHostGuides(): SelfHostGuide[] {
	const guides: SelfHostGuide[] = [{ slug: "index", role: null }];

	for (const page of WORKER_PAGES) {
		guides.push({
			slug: page === "index" ? "workers" : `workers/${page}`,
			role: "worker",
		});
	}
	for (const platform of platformsFor("worker")) {
		guides.push({
			slug: `workers/${platform.slug}`,
			role: "worker",
			platform,
		});
	}

	for (const page of CONTROL_PLANE_PAGES) {
		guides.push({
			slug: page === "index" ? "control-plane" : `control-plane/${page}`,
			role: "control-plane",
		});
	}
	for (const platform of platformsFor("control-plane")) {
		guides.push({
			slug: `control-plane/${platform.slug}`,
			role: "control-plane",
			platform,
		});
	}

	return guides;
}
