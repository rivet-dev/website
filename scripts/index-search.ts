/**
 * Pushes the site search index to Typesense.
 *
 * Every run builds a fresh collection, imports into it, then points the
 * `rivet-docs` alias at it. The swap is atomic, so the dialog never sees an
 * empty or half-imported index, and the previous collection is dropped only
 * after the alias has moved. The search-only key the browser uses is scoped to
 * the alias name, which Typesense honors for aliases as well as collections.
 *
 * Run by `.github/workflows/search-index.yml` on every push to main. Needs:
 *
 *   TYPESENSE_HOST             e.g. xyz-1.a1.typesense.net
 *   TYPESENSE_API_KEY          an admin key, not the search-only key
 *   TYPESENSE_COLLECTION_NAME  alias name, default `rivet-docs`
 *   TYPESENSE_PORT / TYPESENSE_PROTOCOL  default 443 / https
 *
 * `pnpm index:search --dry-run` builds the documents and prints a summary
 * without contacting Typesense; use it to check what a page will index as.
 */
import Typesense from "typesense";
import type { CollectionCreateSchema } from "typesense/lib/Typesense/Collections";

import { listSearchDocuments } from "../src/metadata/search-index";

const PREVIOUS_COLLECTION_PATTERN = /^(.+)_\d+$/;

async function main() {
	const dryRun = process.argv.includes("--dry-run");
	const documents = listSearchDocuments();

	const counts = new Map<string, number>();
	for (const document of documents) {
		counts.set(document.product, (counts.get(document.product) ?? 0) + 1);
	}
	const summary = [...counts]
		.sort()
		.map(([product, count]) => `${product} ${count}`)
		.join(", ");
	console.log(`Built ${documents.length} search documents (${summary})`);

	if (dryRun) {
		for (const document of documents) {
			console.log(
				`${document.path}  [${document.product} › ${document.section}]  ${document.title}`,
			);
		}
		return;
	}

	const host = process.env.TYPESENSE_HOST;
	const apiKey = process.env.TYPESENSE_API_KEY;
	const aliasName = process.env.TYPESENSE_COLLECTION_NAME || "rivet-docs";
	if (!host || !apiKey) {
		throw new Error(
			"TYPESENSE_HOST and TYPESENSE_API_KEY are required (pass --dry-run to skip the upload)",
		);
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
		connectionTimeoutSeconds: 30,
	});

	const collectionName = `${aliasName}_${Date.now()}`;
	const schema: CollectionCreateSchema = {
		name: collectionName,
		fields: [
			{ name: "title", type: "string" },
			{ name: "description", type: "string" },
			{ name: "slug", type: "string" },
			{ name: "headings", type: "string[]" },
			{ name: "content", type: "string" },
			{ name: "path", type: "string", index: false, optional: true },
			{ name: "product", type: "string", facet: true },
			{ name: "section", type: "string", facet: true },
		],
		// Split on the punctuation docs are full of, so "self host" finds
		// "self-host" and "c state" finds "c.state". Without this Typesense
		// strips the symbol and indexes "selfhost" as one token.
		token_separators: ["-", "_", "/", ".", "(", ")"],
	};

	await client.collections().create(schema);
	console.log(`Created collection ${collectionName}`);

	const results = await client
		.collections(collectionName)
		.documents()
		.import(documents, { action: "create" });
	const failures = results.filter((result) => !result.success);
	if (failures.length > 0) {
		await client.collections(collectionName).delete();
		throw new Error(
			`Import failed for ${failures.length} documents; first: ${JSON.stringify(failures[0])}`,
		);
	}
	console.log(`Imported ${results.length} documents`);

	// The alias cannot share a name with a real collection. The first run after
	// this script replaced the in-place indexer still finds one, so clear it.
	const existing = await client.collections().retrieve();
	if (existing.some((collection) => collection.name === aliasName)) {
		await client.collections(aliasName).delete();
		console.log(`Deleted legacy collection ${aliasName} to make room for the alias`);
	}

	await client.aliases().upsert(aliasName, { collection_name: collectionName });
	console.log(`Alias ${aliasName} -> ${collectionName}`);

	const stale = existing.filter((collection) => {
		const match = collection.name.match(PREVIOUS_COLLECTION_PATTERN);
		return match?.[1] === aliasName && collection.name !== collectionName;
	});
	for (const collection of stale) {
		await client.collections(collection.name).delete();
		console.log(`Deleted previous collection ${collection.name}`);
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
