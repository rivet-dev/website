/**
 * What the site search indexes: one document per page.
 *
 * Two sources feed it. Product docs come from `listDocPages()` (the same walk
 * that produces the Markdown mirror and the AI skills), and the shared
 * self-host guides come straight off `src/content/self-host/`. The guides are
 * fanned out per product by the route, so the index points every one at the
 * canonical Actors copy, matching the `<link rel="canonical">` the route emits.
 *
 * Content is lightly de-Markdowned so the snippet the dialog shows reads as
 * prose rather than `##` and `**`. Code stays in, since identifiers such as
 * `c.state` are exactly what people search for.
 */
import fg from "fast-glob";
import { readFileSync } from "node:fs";
import path from "node:path";

import { getProductMetadata } from "../sitemap/product-metadata";
import {
	frontmatterValue,
	listDocPages,
	renderDocMarkdown,
	splitFrontmatter,
} from "./docs-index";
import { mdxToMarkdown } from "./mdx-to-markdown";
import { normalizeSlug, PROJECT_ROOT } from "./shared";

const SELF_HOST_BASE = path.join(PROJECT_ROOT, "src/content/self-host");

/** Mirrors `CANONICAL_PRODUCT` in `src/pages/[product]/self-host/[...slug].astro`. */
const SELF_HOST_CANONICAL_PRODUCT = "actors";

export interface SearchDocument {
	/** Stable across runs so an unchanged page keeps its id: the path with `/` as `__`. */
	id: string;
	title: string;
	description: string;
	/**
	 * Last path segment, e.g. `cors` for a page titled "Cross-Origin Resource
	 * Sharing". Body-only matches all score the same, so this is what lets the
	 * page named after a term outrank pages that mention it.
	 */
	slug: string;
	/** H2/H3 text, queried ahead of the body so a section match outranks a passing mention. */
	headings: string[];
	content: string;
	/** Site path with a leading slash, e.g. `/cloud/byoc`. Relative so any host can navigate to it. */
	path: string;
	/** Where the page lives, as the dialog labels it: `Rivet Cloud` › `BYOC`. */
	product: string;
	section: string;
}

export function listSearchDocuments(): SearchDocument[] {
	const documents = [...docsDocuments(), ...selfHostDocuments()];

	const seen = new Set<string>();
	for (const document of documents) {
		if (seen.has(document.id)) {
			throw new Error(`Duplicate search document id ${document.id}`);
		}
		seen.add(document.id);
	}

	return documents;
}

function docsDocuments(): SearchDocument[] {
	return listDocPages().map((page) => {
		const markdown = renderDocMarkdown(page);
		const [, area = "docs"] = page.slug.split("/");
		return buildDocument({
			path: `/${page.slug}`,
			title: page.title,
			description: page.description,
			markdown,
			product: getProductMetadata(page.product)?.name ?? "Docs",
			section: SECTION_LABELS[area] ?? titleCase(area),
		});
	});
}

function selfHostDocuments(): SearchDocument[] {
	const files = fg.sync("**/*.mdx", { cwd: SELF_HOST_BASE }).sort();

	return files.map((file) => {
		const raw = readFileSync(path.join(SELF_HOST_BASE, file), "utf-8");
		const { frontmatter, body } = splitFrontmatter(raw);
		const title = frontmatterValue(frontmatter, "title");
		if (!title) {
			throw new Error(`src/content/self-host/${file} has no frontmatter title`);
		}

		const slug = normalizeSlug(file.replace(/\.mdx$/, ""));
		const [role] = slug.split("/");
		return buildDocument({
			path: `/${SELF_HOST_CANONICAL_PRODUCT}/self-host${slug ? `/${slug}` : ""}`,
			title,
			description: frontmatterValue(frontmatter, "description") ?? "",
			// Guide snippets live in this repo (`examples/docs/self-host/...`),
			// matching the remark plugin's resolver for `src/content/self-host`.
			markdown: mdxToMarkdown(body, {
				snippetRoot: PROJECT_ROOT,
				sourceLabel: `self-host/${slug || "index"}`,
			}),
			product: "Self-Host",
			section: SECTION_LABELS[role] ?? "",
		});
	});
}

const SECTION_LABELS: Record<string, string> = {
	docs: "Docs",
	tutorials: "Tutorials",
	byoc: "BYOC",
	"control-plane": "Control plane",
	workers: "Workers",
};

function buildDocument(input: {
	path: string;
	title: string;
	description: string;
	markdown: string;
	product: string;
	section: string;
}): SearchDocument {
	return {
		id: input.path.replace(/^\//, "").replace(/\//g, "__") || "index",
		title: input.title,
		description: input.description,
		slug: input.path.split("/").filter(Boolean).at(-1) ?? "",
		headings: extractHeadings(input.markdown),
		content: plainText(input.markdown),
		path: input.path,
		product: input.product,
		section: input.section,
	};
}

function extractHeadings(markdown: string): string[] {
	const headings: string[] = [];
	for (const match of markdown.matchAll(/^#{2,3}[ \t]+(.+?)[ \t]*#*$/gm)) {
		headings.push(inlinePlainText(match[1]));
	}
	return headings;
}

/** Markdown to something a two-line snippet can show without syntax noise. */
function plainText(markdown: string): string {
	return markdown
		.replace(/^```[^\n]*$/gm, "")
		.replace(/^#{1,6}[ \t]+/gm, "")
		.replace(/^>[ \t]?/gm, "")
		.replace(/^[ \t]*[-*+][ \t]+/gm, "")
		.replace(/^\|?[ \t]*:?-{3,}:?[ \t]*(\|[ \t]*:?-{3,}:?[ \t]*)*\|?$/gm, "")
		.split("\n")
		.map(inlinePlainText)
		.join("\n")
		.replace(/\n{2,}/g, "\n")
		.trim();
}

function inlinePlainText(line: string): string {
	return line
		.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
		.replace(/(\*\*|__)(.+?)\1/g, "$2")
		.replace(/(^|[^*\w])[*_](\S(?:.*?\S)?)[*_](?=$|[^*\w])/g, "$1$2")
		.replace(/`([^`]+)`/g, "$1")
		.trim();
}

function titleCase(value: string) {
	return value.replace(
		/(^|-)(\w)/g,
		(_, sep, char) => `${sep === "-" ? " " : ""}${char.toUpperCase()}`,
	);
}
