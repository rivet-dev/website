/**
 * Totality check over the route set.
 *
 * The self-host guides are generated from `deployMatrix`, and the sidebar is
 * built from the same source. If the two ever diverge the sidebar links to
 * routes that were never generated, which is invisible until someone clicks.
 * This asserts:
 *
 *   1. Every self-host guide in the matrix has a source file.
 *   2. Every self-host sidebar href resolves to a guide the matrix generates.
 *   3. Every product docs/tutorials sidebar href resolves to a content file.
 *   4. Every sidebar href appears in exactly one tab.
 *
 * Run with `pnpm check:sitemap`.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { guidesFor } from "../src/sitemap/deployMatrix";
import { products } from "../src/sitemap/products";
import type { AnyPage, SidebarItem } from "../src/lib/sitemap";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SELF_HOST_CONTENT = path.join(ROOT, "src/content/self-host");
const DOCS_CONTENT = path.join(ROOT, "src/content/docs");

const errors: string[] = [];

function collectHrefs(items: (SidebarItem | AnyPage)[], out: string[] = []) {
	for (const item of items) {
		if ("href" in item && typeof item.href === "string") {
			const external =
				("external" in item && item.external) || item.href.startsWith("http");
			if (!external) out.push(item.href);
		}
		if ("pages" in item && Array.isArray(item.pages)) {
			collectHrefs(item.pages, out);
		}
	}
	return out;
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
for (const product of products) {
	for (const guide of guidesFor(product.id)) {
		if (!contentFileExists(SELF_HOST_CONTENT, guide.slug)) {
			errors.push(
				`matrix promises ${product.id}/self-host/${guide.slug} but src/content/self-host/${guide.slug}.mdx is missing`,
			);
		}
	}
}

// 2 + 3. Every sidebar href resolves to something that gets generated.
const seen = new Map<string, string>();

for (const product of products) {
	for (const tab of product.tabs) {
		const generated = new Set(
			tab.id === "self-host"
				? guidesFor(product.id).map((guide) =>
						guide.slug === "index"
							? tab.href
							: `${tab.href}/${guide.slug}`,
					)
				: [],
		);

		for (const href of collectHrefs(tab.sidebar)) {
			// 4. No href may belong to two tabs.
			const owner = `${product.id}:${tab.id}`;
			const previous = seen.get(href);
			if (previous && previous !== owner) {
				errors.push(`${href} appears in both ${previous} and ${owner}`);
			}
			seen.set(href, owner);

			if (!href.startsWith(`/${product.id}/`)) continue;

			if (tab.id === "self-host") {
				if (!generated.has(href)) {
					errors.push(
						`${owner} sidebar links ${href}, which deployMatrix does not generate`,
					);
				}
				continue;
			}

			const slug = href.slice(`/${product.id}/${tab.id}/`.length);
			const base = path.join(DOCS_CONTENT, product.id, tab.id);
			if (!contentFileExists(base, href === tab.href ? "index" : slug)) {
				errors.push(`${owner} sidebar links ${href}, which has no content file`);
			}
		}
	}
}

if (errors.length > 0) {
	console.error(`sitemap check failed with ${errors.length} problem(s):\n`);
	for (const error of errors) console.error(`  - ${error}`);
	process.exit(1);
}

const guideCount = products.reduce(
	(total, product) => total + guidesFor(product.id).length,
	0,
);
console.log(
	`sitemap check passed: ${products.length} products, ${guideCount} generated self-host pages, ${seen.size} unique sidebar hrefs`,
);
