/**
 * Publishes every docs page as plain Markdown next to its HTML, and indexes the
 * same text into Typesense.
 *
 * `/actors/docs/state`     the rendered page
 * `/actors/docs/state.md`  the same page as Markdown, written here
 *
 * The Markdown mirror is what the AI skills link to, so the path is the site
 * path plus `.md` and nothing else. Output lands in `public/`, which Astro
 * copies verbatim into `dist/`.
 *
 * Run by `prebuild`; safe to run on its own with `pnpm gen:markdown`.
 */
import fg from "fast-glob";
import fs from "node:fs/promises";
import path from "node:path";
import Typesense from "typesense";

import {
	listDocPages,
	renderDocMarkdown,
	type DocPage,
} from "../src/metadata/docs-index";
import { PROJECT_ROOT, SITE_BASE_URL } from "../src/metadata/shared";
import { DOCS_PRODUCT_IDS } from "../src/sitemap/docs-sources";

const PUBLIC_DIR = path.join(PROJECT_ROOT, "public");

async function main() {
	const pages = listDocPages();

	await removeStaleMarkdown();

	const rendered = new Map<string, string>();
	for (const page of pages) {
		const markdown = renderDocMarkdown(page);
		rendered.set(page.slug, markdown);

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

	await indexToTypesense(pages, rendered);
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

async function indexToTypesense(
	pages: DocPage[],
	rendered: Map<string, string>,
) {
	const host = process.env.TYPESENSE_HOST;
	const apiKey = process.env.TYPESENSE_API_KEY;
	const collectionName = process.env.TYPESENSE_COLLECTION_NAME || "rivet-docs";

	if (!host || !apiKey) {
		console.log("Typesense credentials not provided, skipping search indexing");
		return;
	}

	// Only index on production so PR previews cannot overwrite the search index.
	const railwayEnv = process.env.RAILWAY_ENVIRONMENT;
	if (railwayEnv && railwayEnv !== "production") {
		console.log(
			`Non-production Railway environment (${railwayEnv}), skipping search indexing`,
		);
		return;
	}

	const client = new Typesense.Client({
		nodes: [
			{
				host,
				port: Number(process.env.TYPESENSE_PORT ?? 443),
				protocol: process.env.TYPESENSE_PROTOCOL || "https",
			},
		],
		apiKey,
		connectionTimeoutSeconds: 5,
	});

	const schema = {
		name: collectionName,
		fields: [
			{ name: "id", type: "string" as const },
			{ name: "title", type: "string" as const },
			{ name: "content", type: "string" as const },
			{ name: "url", type: "string" as const },
			{ name: "hierarchy", type: "object" as const, optional: true },
		],
		enable_nested_fields: true,
	};

	try {
		await client.collections(collectionName).retrieve();
		try {
			await client.collections(collectionName).update(schema);
		} catch {
			await client.collections(collectionName).delete();
			await client.collections().create(schema);
		}
	} catch {
		await client.collections().create(schema);
	}

	const documents = pages.map((page, index) => ({
		id: `doc_${index}`,
		title: page.title,
		content: rendered.get(page.slug) ?? "",
		url: `${SITE_BASE_URL}/${page.slug}`,
		hierarchy: { lvl0: "Documentation", lvl1: page.title },
	}));

	try {
		await client
			.collections(collectionName)
			.documents()
			.delete({ filter_by: "id:*" });
	} catch (error) {
		console.log("Nothing to clear from the search index:", error);
	}

	await client.collections(collectionName).documents().import(documents);
	console.log(`Indexed ${documents.length} documents to Typesense`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
