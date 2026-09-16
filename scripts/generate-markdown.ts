/**
 * Publishes every docs page as plain Markdown next to its HTML.
 *
 * `/actors/docs/state`     the rendered page
 * `/actors/docs/state.md`  the same page as Markdown, written here
 *
 * The Markdown mirror is what the AI skills link to, so the path is the site
 * path plus `.md` and nothing else. Output lands in `public/`, which Astro
 * copies verbatim into `dist/`.
 *
 * Run by `prebuild`; safe to run on its own with `pnpm gen:markdown`. The search
 * index is built from the same pages by `scripts/index-search.ts`.
 */
import fg from "fast-glob";
import fs from "node:fs/promises";
import path from "node:path";

import { listDocPages, renderDocMarkdown } from "../src/metadata/docs-index";
import { PROJECT_ROOT } from "../src/metadata/shared";
import { DOCS_PRODUCT_IDS } from "../src/sitemap/docs-sources";

const PUBLIC_DIR = path.join(PROJECT_ROOT, "public");

async function main() {
	const pages = listDocPages();

	await removeStaleMarkdown();

	for (const page of pages) {
		const markdown = renderDocMarkdown(page);
		const outputPath = path.join(PUBLIC_DIR, `${page.slug}.md`);
		await fs.mkdir(path.dirname(outputPath), { recursive: true });
		await fs.writeFile(outputPath, `# ${page.title}\n\n${markdown}\n`);
	}

	const counts = new Map<string, number>();
	for (const page of pages) {
		counts.set(page.product, (counts.get(page.product) ?? 0) + 1);
	}
	const summary = [...counts]
		.sort()
		.map(([product, count]) => `${product} ${count}`)
		.join(", ");
	console.log(`Generated ${pages.length} markdown pages (${summary})`);
}

/**
 * Drop Markdown from a previous run so deleted pages actually disappear. Only
 * `.md` under the product trees, because `pnpm assemble` copies product assets
 * into `public/` before this runs.
 */
async function removeStaleMarkdown() {
	const stale = await fg(
		DOCS_PRODUCT_IDS.map((product) => `${product}/**/*.md`),
		{ cwd: PUBLIC_DIR, absolute: true },
	);
	await Promise.all(stale.map((file) => fs.rm(file, { force: true })));
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
