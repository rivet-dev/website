import { mdxAnnotations } from "mdx-annotations";
import remarkGfm from "remark-gfm";
import { execSync } from "child_process";
import { visit } from "unist-util-visit";
import { remarkCodeSnippet } from "./remark-code-snippet";
import { snippetRootForContentPath } from "../sitemap/docs-sources.node";
import { canonicalizeInternalHref } from "../lib/internalHref";

// Remark plugin to add last modified time from git history
function remarkModifiedTime() {
	return function (_tree: unknown, file: { history: string[]; data: { astro?: { frontmatter?: Record<string, unknown> } } }) {
		const filepath = file.history[0];
		if (!filepath) return;

		try {
			// Use stdio: 'pipe' to suppress stderr output in CI/Docker environments
			const result = execSync(`git log -1 --pretty="format:%cI" "${filepath}"`, {
				stdio: ['pipe', 'pipe', 'pipe'],
				timeout: 5000,
			});
			const lastModified = result.toString().trim();
			if (lastModified) {
				file.data.astro = file.data.astro || {};
				file.data.astro.frontmatter = file.data.astro.frontmatter || {};
				file.data.astro.frontmatter.lastModified = lastModified;
			}
		} catch {
			// Git command may fail for new files not yet committed or in Docker builds without git history
		}
	};
}

// Preserve plain code fence metastrings (for example: ```ts registry.ts @hide) on hProperties.
// mdx-annotations only consumes JSON-like annotation blocks, so we bridge remaining metastrings
// using a neutral property that does not go through mdx-annotations' recma parser.
function remarkCodeFenceMetaToAnnotation() {
	return (tree: unknown) => {
		visit(tree, "code", (node: unknown) => {
			const code = node as {
				meta?: string | null;
				data?: {
					hProperties?: Record<string, unknown>;
				};
			};
			const meta = code.meta?.trim();
			if (!meta) return;

			const data = (code.data ??= {});
			const hProperties = (data.hProperties ??= {});
			const existingMetaString = hProperties.metastring;

			if (
				typeof existingMetaString !== "string" ||
				existingMetaString.trim().length === 0
			) {
				hProperties.metastring = meta;
			}
		});
	};
}

/**
 * Canonicalize authored internal links at the MDX boundary. This covers plain
 * Markdown links as well as literal `<a href="…">` elements without changing
 * relative, file, query-string, fragment, or external URLs.
 */
function remarkCanonicalInternalLinks() {
	return (tree: unknown) => {
		visit(tree, (node: unknown) => {
			const link = node as {
				type?: string;
				url?: string;
				name?: string;
				attributes?: Array<{
					type?: string;
					name?: string;
					value?: unknown;
				}>;
			};

			if (link.type === "link" && typeof link.url === "string") {
				link.url = canonicalizeInternalHref(link.url);
				return;
			}

			if (
				(link.type === "mdxJsxFlowElement" ||
					link.type === "mdxJsxTextElement") &&
				link.name === "a"
			) {
				const href = link.attributes?.find(
					(attribute) =>
						attribute.type === "mdxJsxAttribute" &&
						attribute.name === "href" &&
						typeof attribute.value === "string",
				);
				if (href && typeof href.value === "string") {
					href.value = canonicalizeInternalHref(href.value);
				}
			}
		});
	};
}

export const remarkPlugins = [
	// Inline <CodeSnippet file="…" /> example files before anything else reads
	// the code body, so embedded source flows through the normal Shiki pipeline.
	[remarkCodeSnippet, snippetRootForContentPath],
	remarkCanonicalInternalLinks,
	mdxAnnotations.remark,
	remarkCodeFenceMetaToAnnotation,
	remarkGfm,
	remarkModifiedTime,
];
