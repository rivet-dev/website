const SITE_ORIGINS = new Set(["https://rivet.dev", "http://rivet.dev"]);

function splitSuffix(value: string): { pathname: string; suffix: string } {
	const boundary = value.search(/[?#]/);
	return boundary === -1
		? { pathname: value, suffix: "" }
		: { pathname: value.slice(0, boundary), suffix: value.slice(boundary) };
}

function canonicalizePath(pathname: string): string {
	if (!pathname || pathname === "/" || pathname.endsWith("/")) return pathname || "/";
	const lastSegment = pathname.slice(pathname.lastIndexOf("/") + 1);
	return lastSegment.includes(".") ? pathname : `${pathname}/`;
}

/**
 * Returns the canonical trailing-slash form for site-owned directory links.
 * Fragments, query strings, files, and external/protocol URLs are preserved.
 */
export function canonicalizeInternalHref(href?: string | null): string {
	if (!href) return href ?? "";
	if (href.startsWith("#") || href.startsWith("?")) return href;

	if (href.startsWith("/")) {
		if (href.startsWith("//")) return href;
		const { pathname, suffix } = splitSuffix(href);
		return `${canonicalizePath(pathname)}${suffix}`;
	}

	try {
		const url = new URL(href);
		if (!SITE_ORIGINS.has(url.origin)) return href;
		url.protocol = "https:";
		url.pathname = canonicalizePath(url.pathname);
		return url.toString();
	} catch {
		// Relative links are meaningful inside authored docs. Leave them relative
		// rather than guessing which route depth owns them.
		return href;
	}
}
