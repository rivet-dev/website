/**
 * Totality check over the route set.
 *
 * The self-host guides are generated from `deployMatrix`, and the sidebar is
 * built from the same source. If the two ever diverge the sidebar links to
 * routes that were never generated, which is invisible until someone clicks.
 * This asserts:
 *
 *   1. Every self-host guide in the matrix has a source file.
 *   2. Every Deploy sidebar href resolves to a guide the matrix generates or
 *      to a page of the Rivet Cloud bundle, and every routed Deploy page is in
 *      the sidebar.
 *   3. Every product docs/integrations sidebar href resolves to a content file.
 *   4. Every sidebar href appears in exactly one tab.
 *   5. Every routed, indexable product-doc page has a sidebar or content inlink.
 *   6. Every Guides sidebar href resolves to an Actors `learn` page or a
 *      website-owned guide.
 *   7. The site Integrations sidebar (`/integrations/`) and the Actors
 *      `integrations` content directory agree exactly.
 *
 * Run with `pnpm check:sitemap`.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import fg from "fast-glob";

import { redirects, wildcardRedirects } from "../redirects.mjs";
import { canonicalizeInternalHref } from "../src/lib/internalHref";
import {
	CLOUD_BUNDLE_ID,
	DEPLOY_ROUTE_PREFIX,
	SELF_HOST_ROUTE_PREFIX,
	deploySlugForContentId,
	selfHostHref,
} from "../src/sitemap/deploy";
import { selfHostGuides } from "../src/sitemap/deployMatrix";
import {
	ACTORS_LEARN_CONTENT_PREFIX,
	GUIDES_ROUTE_PREFIX,
	SITE_GUIDES,
} from "../src/sitemap/guides";
import { integrationSidebar } from "../src/data/integrations";
import {
	INTEGRATIONS_ROUTE_PREFIX,
	SITE_INTEGRATIONS_CONTENT_PREFIX,
	SITE_INTEGRATIONS_PRODUCT,
} from "../src/sitemap/integrations";
import { PRODUCTS } from "../src/sitemap/product-metadata";
import {
	deploySidebar,
	guidesSidebar,
	products,
} from "../src/sitemap/products";
import type { AnyPage, SidebarItem } from "../src/lib/sitemap";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SELF_HOST_CONTENT = path.join(ROOT, "src/content/self-host");
const DOCS_CONTENT = path.join(ROOT, "src/content/docs");
// Website-owned solution guides on the Guides tab.
const GUIDES_CONTENT = path.join(ROOT, "src/content/guides");

const errors: string[] = [];

function normalizeHref(href: string) {
	return canonicalizeInternalHref(href);
}

function isRedirectRoute(href: string): boolean {
	const bare = href === "/" ? "/" : href.replace(/\/$/, "");
	if (bare in redirects) return true;
	return wildcardRedirects.some(({ from }) =>
		bare.startsWith(`${from.replace(/\/$/, "")}/`),
	);
}

function collectHrefs(items: (SidebarItem | AnyPage)[], out: string[] = []) {
	for (const item of items) {
		if ("href" in item && typeof item.href === "string") {
			const external =
				("external" in item && item.external) || item.href.startsWith("http");
			if (!external) out.push(normalizeHref(item.href));
		}
		if ("pages" in item && Array.isArray(item.pages)) {
			collectHrefs(item.pages, out);
		}
	}
	return out;
}

function collectContentInlinks(): Map<string, Set<string>> {
	const inlinks = new Map<string, Set<string>>();
	for (const file of fg.sync("*/*/**/*.mdx", { cwd: DOCS_CONTENT })) {
		const [product, tab, ...rest] = file.split("/");
		const stem = rest
			.join("/")
			.replace(/\.mdx$/, "")
			.replace(/(^|\/)index$/, "");
		const sourceRoute = normalizeHref(
			stem ? `/${product}/${tab}/${stem}` : `/${product}/${tab}`,
		);
		const source = readFileSync(path.join(DOCS_CONTENT, file), "utf8");
		const hrefs = [
			...source.matchAll(/\]\((\/[^)\s]+)(?:\s+["'][^)]*["'])?\)/g),
			...source.matchAll(/\bhref\s*=\s*["'](\/[^"']+)["']/g),
		];
		// A shared bundle is authored against its source product's routes and
		// re-parented at render time (see RerootLinks.astro); mirror that here.
		const bundleOf = PRODUCTS.find((candidate) => candidate.id === product)?.bundleOf;
		const reroot = (pathname: string) =>
			bundleOf && (pathname === `/${bundleOf}/${tab}` || pathname.startsWith(`/${bundleOf}/${tab}/`))
				? `/${product}/${tab}${pathname.slice(`/${bundleOf}/${tab}`.length)}`
				: pathname;
		for (const match of hrefs) {
			const pathname = reroot(match[1].split(/[?#]/, 1)[0]);
			const target = normalizeHref(pathname);
			if (target === sourceRoute) continue;
			const owners = inlinks.get(target) ?? new Set<string>();
			owners.add(sourceRoute);
			inlinks.set(target, owners);
		}
	}
	return inlinks;
}

/** `workers/kubernetes` -> src/content/self-host/workers/kubernetes.mdx */
function contentFileExists(base: string, slug: string) {
	const stem = slug === "index" || slug === "" ? "index" : slug;
	return (
		existsSync(path.join(base, `${stem}.mdx`)) ||
		existsSync(path.join(base, stem, "index.mdx"))
	);
}

// 1. Every guide the matrix promises has a source file.
for (const guide of selfHostGuides()) {
	if (!contentFileExists(SELF_HOST_CONTENT, guide.slug)) {
		errors.push(
			`matrix promises ${SELF_HOST_ROUTE_PREFIX}/${guide.slug} but src/content/self-host/${guide.slug}.mdx is missing`,
		);
	}
}

// 3 + 4 + 5. Every product sidebar href resolves to something that gets generated.
const seen = new Map<string, string>();
const contentInlinks = collectContentInlinks();

for (const product of products) {
	for (const tab of product.tabs) {
		const owner = `${product.id}:${tab.id}`;

		for (const href of collectHrefs(tab.sidebar)) {
			// Pages outside the product's own namespace are shared by design (a
			// standalone product's Self-Host tab links out to /docs/deploy/), so
			// they are neither owned nor checked here.
			if (!href.startsWith(`/${product.id}/`)) continue;

			// 4. No href may belong to two tabs.
			const previous = seen.get(href);
			if (previous && previous !== owner) {
				errors.push(`${href} appears in both ${previous} and ${owner}`);
			}
			seen.set(href, owner);

			const slug = href
				.slice(`/${product.id}/${tab.id}/`.length)
				.replace(/\/$/, "");
			const base = path.join(DOCS_CONTENT, product.id, tab.id);
			if (
				!contentFileExists(
					base,
					href === normalizeHref(tab.href) ? "index" : slug,
				)
			) {
				errors.push(
					`${owner} sidebar links ${href}, which has no content file`,
				);
			}
		}

		// Hidden tabs remain routable for existing inbound links, but they are
		// deliberately absent from navigation and noindexed. Everything else that
		// the product-doc route generates must be discoverable from its sidebar.
		if (tab.hidden || tab.id === "overview" || tab.id === "use-cases") {
			continue;
		}
		// A tab that links out (Sandboxes' Documentation -> /agentos/docs/)
		// generates nothing; the bundle's pages are checked under their owner.
		if (!tab.href.startsWith(`/${product.id}/`)) continue;

		const base = path.join(DOCS_CONTENT, product.id, tab.id);
		if (!existsSync(base)) continue;
		const sidebarHrefs = new Set(collectHrefs(tab.sidebar));
		for (const file of fg.sync("**/*.mdx", { cwd: base })) {
			const stem = file.replace(/\.mdx$/, "").replace(/(^|\/)index$/, "");
			const href = normalizeHref(
				stem ? `/${product.id}/${tab.id}/${stem}` : `/${product.id}/${tab.id}`,
			);
			if (isRedirectRoute(href)) continue;
			if (!sidebarHrefs.has(href) && !contentInlinks.has(href)) {
				errors.push(
					`${owner} routes ${href}, but neither its sidebar nor another docs page links it`,
				);
			}
		}
	}
}

// 2. The Deploy sidebar and the routes under /docs/deploy/ must agree exactly:
// the self-host guides come from deployMatrix, the managed options from the
// Rivet Cloud bundle, and both are reached only through this sidebar.
{
	const routed = new Set<string>();
	for (const guide of selfHostGuides()) {
		routed.add(normalizeHref(selfHostHref(guide.slug)));
	}
	for (const file of fg.sync("**/*.mdx", {
		cwd: path.join(DOCS_CONTENT, CLOUD_BUNDLE_ID),
	})) {
		const contentId = `${CLOUD_BUNDLE_ID}/${file.replace(/\.mdx$/, "").replace(/(^|\/)index$/, "")}`;
		const slug = deploySlugForContentId(contentId);
		if (!slug) {
			errors.push(`${contentId} has no route under ${DEPLOY_ROUTE_PREFIX}/`);
			continue;
		}
		routed.add(normalizeHref(`/${slug}`));
	}

	const deployHrefs = new Set(collectHrefs(deploySidebar()));
	for (const href of deployHrefs) {
		if (!href.startsWith(`${DEPLOY_ROUTE_PREFIX}/`)) {
			errors.push(
				`Deploy sidebar links ${href}, which is outside ${DEPLOY_ROUTE_PREFIX}/`,
			);
			continue;
		}
		if (!routed.has(href)) {
			errors.push(`Deploy sidebar links ${href}, which has no content file`);
		}
	}
	for (const href of routed) {
		if (!deployHrefs.has(href)) {
			errors.push(
				`Deploy routes ${href}, but the Deploy sidebar does not link it`,
			);
		}
	}
}

// 6. Every Guides sidebar href is an Actors `learn` page or a website guide.
{
	const learnContent = path.join(DOCS_CONTENT, ACTORS_LEARN_CONTENT_PREFIX);
	for (const href of collectHrefs(guidesSidebar())) {
		if (!href.startsWith(`${GUIDES_ROUTE_PREFIX}/`)) {
			errors.push(
				`Guides sidebar links ${href}, which is outside ${GUIDES_ROUTE_PREFIX}/`,
			);
			continue;
		}
		const slug = href
			.slice(`${GUIDES_ROUTE_PREFIX}/`.length)
			.replace(/\/$/, "");
		// The Guides overview is website-owned; the Actors bundle carries only
		// the worked examples under it.
		const siteGuide = slug
			? SITE_GUIDES.some((guide) => guide.slug === slug) &&
				contentFileExists(GUIDES_CONTENT, slug)
			: contentFileExists(GUIDES_CONTENT, "index");
		if (!siteGuide && !contentFileExists(learnContent, slug)) {
			errors.push(`Guides sidebar links ${href}, which has no content file`);
		}
	}
}

// 7. The site Integrations sidebar and the Actors `integrations` content
// directory agree exactly: every href has a file, every file has a sidebar link.
{
	const base = path.join(DOCS_CONTENT, SITE_INTEGRATIONS_CONTENT_PREFIX);
	const sidebarHrefs = new Set(
		collectHrefs(integrationSidebar(SITE_INTEGRATIONS_PRODUCT)),
	);
	for (const href of sidebarHrefs) {
		if (!href.startsWith(`${INTEGRATIONS_ROUTE_PREFIX}/`)) {
			errors.push(
				`Integrations sidebar links ${href}, which is outside ${INTEGRATIONS_ROUTE_PREFIX}/`,
			);
			continue;
		}
		const slug = href
			.slice(`${INTEGRATIONS_ROUTE_PREFIX}/`.length)
			.replace(/\/$/, "");
		if (!contentFileExists(base, slug || "index")) {
			errors.push(
				`Integrations sidebar links ${href}, which has no content file`,
			);
		}
	}
	for (const file of fg.sync("**/*.mdx", { cwd: base })) {
		const stem = file.replace(/\.mdx$/, "").replace(/(^|\/)index$/, "");
		const href = normalizeHref(
			stem
				? `${INTEGRATIONS_ROUTE_PREFIX}/${stem}`
				: INTEGRATIONS_ROUTE_PREFIX,
		);
		if (isRedirectRoute(href)) continue;
		if (!sidebarHrefs.has(href) && !contentInlinks.has(href)) {
			errors.push(
				`Integrations routes ${href}, but neither its sidebar nor another docs page links it`,
			);
		}
	}
}

if (errors.length > 0) {
	console.error(`sitemap check failed with ${errors.length} problem(s):\n`);
	for (const error of errors) console.error(`  - ${error}`);
	process.exit(1);
}

console.log(
	`sitemap check passed: ${products.length} products, ${selfHostGuides().length} self-host pages, ${seen.size} unique product sidebar hrefs`,
);
