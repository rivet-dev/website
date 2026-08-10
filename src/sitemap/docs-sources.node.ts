/**
 * Filesystem side of the docs-source map. Kept apart from `./docs-sources.ts`
 * because it touches `node:fs` and must never reach browser code.
 *
 * Resolution order for a product's repo root:
 *
 *   1. an existing `src/content/docs/<product>` symlink — the manual override
 *   2. sibling checkout next to this repo (../<repo>)   — the local dev default
 *   3. `vendor/<product>`                                — CI, clone-website-only
 *
 * The symlink comes first on purpose: it is the one override mechanism, so
 * repointing it with `ln -sfn` moves everything at once — the content Astro
 * globs, the snippet root, and the rivetkit version read at config time. Without
 * that, a repointed symlink would serve docs from one checkout while snippets
 * came from another.
 */
import { existsSync, realpathSync, lstatSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
	DOCS_SOURCES,
	SHARED_CONTENT_PRODUCT,
	productFromPath,
} from "./docs-sources";

export const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));

/** Where assemble puts each product's content symlink. */
export function contentLinkPath(productId: string): string {
	return path.resolve(REPO_ROOT, "src/content/docs", productId);
}

/**
 * The repo root behind an existing content symlink. The link points at
 * `<repo>/docs/content`, so the root is two levels up.
 */
function rootFromContentLink(productId: string): string | undefined {
	const link = contentLinkPath(productId);
	try {
		if (!lstatSync(link).isSymbolicLink()) return undefined;
		return path.resolve(realpathSync(link), "../..");
	} catch {
		return undefined;
	}
}

/** Absolute path to a product's repo root, or undefined if none resolves. */
export function docsRoot(productId: string): string | undefined {
	const source = DOCS_SOURCES[productId];
	if (!source) return undefined;

	const linked = rootFromContentLink(productId);
	if (linked) return linked;

	const sibling = path.resolve(REPO_ROOT, "..", source.repo);
	if (existsSync(sibling)) return sibling;

	const vendored = path.resolve(REPO_ROOT, "vendor", productId);
	if (existsSync(vendored)) return vendored;

	return undefined;
}

/** Same, but throws with something actionable rather than silently degrading. */
export function requireDocsRoot(productId: string): string {
	const root = docsRoot(productId);
	if (!root) {
		const source = DOCS_SOURCES[productId];
		throw new Error(
			`No docs source for "${productId}". Expected a sibling checkout at ` +
				`${path.resolve(REPO_ROOT, "..", source?.repo ?? productId)} or a vendored ` +
				`bundle at ${path.resolve(REPO_ROOT, "vendor", productId)}. ` +
				`Clone the repo next to this one, or run \`pnpm assemble\`.`,
		);
	}
	return root;
}

/**
 * Repo root that a content file's snippets resolve against.
 *
 * Product docs use their own repo. Everything else authored in this repo — the
 * shared self-host guides, cookbook, learn, blog posts — embeds Rivet's
 * examples, so it falls back to the Rivet repo.
 */
export function snippetRootForContentPath(
	contentPath: string | undefined,
): string | undefined {
	if (contentPath) {
		// Product docs are symlinked in, and Vite reports the resolved realpath
		// (`/home/me/agentos/docs/content/...`), so the `src/content/docs/<product>`
		// shape is usually gone by the time we see it. Match on the repo root
		// first and fall back to the path shape.
		const normalized = path.resolve(contentPath);
		for (const productId of Object.keys(DOCS_SOURCES)) {
			const root = docsRoot(productId);
			if (root && normalized.startsWith(`${path.resolve(root)}${path.sep}`)) {
				return root;
			}
		}

		const product = productFromPath(contentPath);
		if (product) return docsRoot(product);
	}

	return docsRoot(SHARED_CONTENT_PRODUCT);
}
