import { PRODUCTS } from "../sitemap/product-metadata";

export interface RouteSeoPolicy {
	index: boolean;
	follow: boolean;
	sitemap: boolean;
}

const hiddenPrefixes = PRODUCTS.flatMap((product) =>
	(product.hiddenTabs ?? []).map((tab) => `/${product.id}/${tab}/`),
);

function pathnameOf(value: string | URL): string {
	if (value instanceof URL) return value.pathname;
	try {
		return new URL(value, "https://rivet.dev").pathname;
	} catch {
		return value;
	}
}

function slash(pathname: string): string {
	if (pathname === "/" || pathname.endsWith("/")) return pathname;
	return `${pathname}/`;
}

export function getRouteSeoPolicy(value: string | URL): RouteSeoPolicy {
	const pathname = slash(pathnameOf(value));
	const isHiddenTab = hiddenPrefixes.some((prefix) => pathname.startsWith(prefix));
	const isComparison = /^\/[^/]+\/compare\//.test(pathname);
	const isPrivateUtility =
		pathname.includes("/api/") ||
		pathname.includes("/internal/") ||
		pathname.startsWith("/cookbook/");
	const isNoncanonicalSelfHost =
		/^\/[^/]+\/self-host\//.test(pathname) &&
		!pathname.startsWith("/actors/self-host/");
	const isContextualAiDocs =
		/^\/[^/]+\/docs\/ai\/(?:mcp|skills)\/$/.test(pathname);

	if (isHiddenTab || isComparison || isPrivateUtility) {
		return { index: false, follow: true, sitemap: false };
	}

	return {
		index: true,
		follow: true,
		sitemap: !isNoncanonicalSelfHost && !isContextualAiDocs,
	};
}

/** Omit the default directive; serialize only an intentional restriction. */
export function robotsDirective(policy: RouteSeoPolicy): string | undefined {
	if (policy.index && policy.follow) return undefined;
	return `${policy.index ? "index" : "noindex"}, ${policy.follow ? "follow" : "nofollow"}`;
}
