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
 * Support is platform x role x product, not platform x role. The platform x role
 * half lives in `@rivetkit/shared-data` so the `<Hosting>` component and this
 * module cannot disagree; the product dimension is layered on here.
 *
 * Both `deploySidebar()` and the route's `getStaticPaths()` read from this. If
 * they diverge, the sidebar links to routes that were never generated, so keep
 * this the only place that answers "does this guide exist".
 */

/**
 * Per-product exclusions on top of the platform x role matrix.
 *
 * Empty by design: every product supports the same platforms.
 *
 * In particular, agentOS is NOT a special case. It is tempting to exclude it from
 * the serverless platforms on the grounds that "file system, shell, tools" needs
 * a persistent disk, but agentOS runs inside actors and the actor supplies the
 * persistence, so the host platform never has to. Do not add that exclusion.
 *
 * The hook stays because it is the seam a future product-specific restriction
 * would use, and retrofitting it later would mean reworking both the sidebar
 * builder and `getStaticPaths`.
 */
const PRODUCT_PLATFORM_EXCLUSIONS: Record<
	string,
	(option: DeployOption) => boolean
> = {};

export function platformSupport(
	productId: string,
	role: DeployRole,
	option: DeployOption,
): DeploySupport {
	if (PRODUCT_PLATFORM_EXCLUSIONS[productId]?.(option)) {
		return "unsupported";
	}
	return option.support[role];
}

/** Platform guides that exist for this product and role, in registry order. */
export function platformsFor(
	productId: string,
	role: DeployRole,
): DeployOption[] {
	return deployOptions.filter(
		(option) => platformSupport(productId, role, option) !== "unsupported",
	);
}

/**
 * Non-platform pages in each section. Platform guides are appended after these
 * by the sidebar builder and the route.
 */
export const WORKER_PAGES = ["index", "production-checklist"] as const;

export const CONTROL_PLANE_PAGES = [
	"index",
	"configuration",
	"ports",
	"storage",
	"tls",
	"multi-region",
	"upgrades",
	"backups",
	"production-checklist",
] as const;

export interface SelfHostGuide {
	/** Path under the tab, e.g. `workers/kubernetes`. */
	slug: string;
	role: DeployRole | null;
	/** Set when the guide is a platform guide. */
	platform?: DeployOption;
}

/** Every self-host guide that should exist for a product, in sidebar order. */
export function guidesFor(productId: string): SelfHostGuide[] {
	const guides: SelfHostGuide[] = [{ slug: "index", role: null }];

	for (const page of WORKER_PAGES) {
		guides.push({
			slug: page === "index" ? "workers" : `workers/${page}`,
			role: "worker",
		});
	}
	for (const platform of platformsFor(productId, "worker")) {
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
	for (const platform of platformsFor(productId, "control-plane")) {
		guides.push({
			slug: `control-plane/${platform.slug}`,
			role: "control-plane",
			platform,
		});
	}

	return guides;
}
