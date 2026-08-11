import { visit } from "unist-util-visit";
import { readFileSync } from "node:fs";
import { resolve, extname } from "node:path";

/**
 * `<CodeSnippet>` — embed a real example file into the docs at build time:
 *
 *     <CodeSnippet file="examples/quickstart/hello-world/index.ts" />
 *     <CodeSnippet file="examples/foo/index.ts" region="setup" title="Setup" />
 *
 * The referenced file's content is inlined as a normal code node, so the usual
 * Shiki/Code pipeline renders it (highlighting, copy button, a "View source on
 * GitHub" link, CodeGroup tabs). Because the rendered code IS the real, separately
 * type-checked example, there is no in-Astro type checking — correctness comes
 * from the example project's own `tsc`.
 *
 * This is the ONLY embed API. A bare ```ts file="server.ts"``` fence (no slash)
 * remains a plain title label; it is NOT read from disk.
 *
 * Embed a marked region with `region="name"`, delimited in the source by
 * `// docs:start name` … `// docs:end name` (markers are stripped, region is
 * dedented).
 *
 * Paths are relative to the repo that owns the page. Product docs are symlinked
 * in from their own repos, so an agentOS page's `examples/...` means agentOS's
 * examples; the caller supplies a resolver that maps the MDX file's path to the
 * right root. Website-owned content (cookbook, self-host guides) falls back to
 * the Rivet repo.
 */
type RootResolver = (mdxPath: string | undefined) => string | undefined;

const LANG_BY_EXT: Record<string, string> = {
	".ts": "ts",
	".tsx": "tsx",
	".js": "js",
	".jsx": "jsx",
	".mjs": "js",
	".cjs": "js",
	".json": "json",
	".sh": "bash",
	".bash": "bash",
	".rs": "rust",
	".py": "python",
	".toml": "toml",
	".yaml": "yaml",
	".yml": "yaml",
	".md": "markdown",
	".mdx": "markdown",
	".html": "html",
	".css": "css",
};

const MARKER = /\/\/\s*docs:(start|end)(?:\s+(\S+))?/;

function stripTrailingBlank(s: string): string {
	return s.replace(/\s+$/, "");
}

function extractRegion(
	source: string,
	region: string | undefined,
	file: string,
): string {
	const lines = source.split("\n");
	if (!region) {
		return stripTrailingBlank(lines.filter((l) => !MARKER.test(l)).join("\n"));
	}
	const startIdx = lines.findIndex((l) => {
		const m = l.match(MARKER);
		return m && m[1] === "start" && m[2] === region;
	});
	const endIdx = lines.findIndex((l) => {
		const m = l.match(MARKER);
		return m && m[1] === "end" && m[2] === region;
	});
	if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
		throw new Error(
			`<CodeSnippet>: region "${region}" not found (or malformed) in ${file}`,
		);
	}
	const body = lines.slice(startIdx + 1, endIdx).filter((l) => !MARKER.test(l));
	const indents = body
		.filter((l) => l.trim().length > 0)
		.map((l) => l.match(/^\s*/)?.[0].length ?? 0);
	const dedent = indents.length ? Math.min(...indents) : 0;
	return stripTrailingBlank(body.map((l) => l.slice(dedent)).join("\n"));
}

/**
 * Read a `<CodeSnippet>` target off disk.
 *
 * Shared with the static markdown mirror (`src/metadata/mdx-to-markdown.ts`), so
 * `/actors/docs/state.md` inlines exactly the code `/actors/docs/state` renders.
 */
export function loadSnippet(
	root: string,
	file: string,
	region?: string,
): { lang: string; value: string } {
	const abs = resolve(root, file);
	let source: string;
	try {
		source = readFileSync(abs, "utf8");
	} catch {
		throw new Error(
			`<CodeSnippet>: cannot read file "${file}" (resolved to ${abs})`,
		);
	}

	return {
		lang: LANG_BY_EXT[extname(abs).toLowerCase()] ?? "text",
		value: extractRegion(source, region, file),
	};
}

function getAttr(
	node: {
		attributes?: Array<{ type?: string; name?: string; value?: unknown }>;
	},
	name: string,
): string | undefined {
	const attr = (node.attributes ?? []).find(
		(a) => a.type === "mdxJsxAttribute" && a.name === name,
	);
	if (!attr) return undefined;
	return typeof attr.value === "string" ? attr.value : undefined;
}

export function remarkCodeSnippet(resolveRoot?: RootResolver) {
	return (tree: unknown, file?: { path?: string; history?: string[] }) => {
		const mdxPath = file?.path ?? file?.history?.[0];
		const embedRoot = resolveRoot?.(mdxPath);
		if (!embedRoot) {
			throw new Error(
				`<CodeSnippet>: could not resolve an examples root for ${mdxPath ?? "unknown file"}. ` +
					"Clone the owning product repo next to the website, or run `pnpm assemble`.",
			);
		}
		visit(
			tree,
			(node: unknown) => {
				const n = node as { type?: string; name?: string };
				return (
					(n.type === "mdxJsxFlowElement" ||
						n.type === "mdxJsxTextElement") &&
					n.name === "CodeSnippet"
				);
			},
			(
				node: unknown,
				index: number | undefined,
				parent: { children?: unknown[] } | undefined,
			) => {
				if (!parent || index == null || !parent.children) return;
				const el = node as {
					attributes?: Array<{
						type?: string;
						name?: string;
						value?: unknown;
					}>;
				};
				const file = getAttr(el, "file");
				if (!file) {
					throw new Error(
						'<CodeSnippet> requires a string `file` attribute, e.g. file="examples/foo/index.ts"',
					);
				}
				const region = getAttr(el, "region");
				const title = getAttr(el, "title");
				const lang = getAttr(el, "lang");

				const snippet = loadSnippet(embedRoot, file, region);

				// `file=` in the meta drives the basename tab label + GitHub source
				// link in the Code component; `title=` overrides the label.
				const meta = [`file="${file}"`];
				if (title) meta.push(`title="${title}"`);

				parent.children[index] = {
					type: "code",
					lang: lang ?? snippet.lang,
					meta: meta.join(" "),
					value: snippet.value,
				};
			},
		);
	};
}
