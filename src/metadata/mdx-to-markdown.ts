/**
 * MDX -> plain Markdown.
 *
 * Every docs page is published twice: as HTML at `/{slug}` and as Markdown at
 * `/{slug}.md`. The Markdown copy is what the AI skills link to, so it has to be
 * the whole page, not a summary — including the code, which in MDX lives behind
 * `<CodeSnippet file="examples/...">` rather than in the page.
 *
 * The conversion is deliberately textual. It unwraps the handful of layout
 * components the docs use (`Steps`, `Tabs`, `CardGroup`, callouts), inlines
 * snippets, and drops everything else. Fenced code is masked out first so none
 * of the stripping can reach inside it.
 */
import { loadSnippet } from "../mdx/remark-code-snippet";

export interface ConvertOptions {
	/**
	 * Repo root that `<CodeSnippet file="...">` paths resolve against. Omit and
	 * snippets are dropped rather than inlined.
	 */
	snippetRoot?: string;
	/** Reported in errors so a bad snippet names the page it came from. */
	sourceLabel?: string;
}

export function mdxToMarkdown(body: string, options: ConvertOptions = {}) {
	let text = inlineCodeSnippets(body ?? "", options);

	const { replaced, restore } = maskCodeBlocks(text);
	text = replaced;

	text = text.replace(/^[ \t]*import\s+[^;]+;?\s*$/gm, "");
	text = text.replace(/^[ \t]*export\s+[^;]+;?\s*$/gm, "");
	text = text.replace(/\{\/\*[\s\S]*?\*\/\}/g, "");

	text = stripWrapperTags(text, "Steps");
	text = stripWrapperTags(text, "Tabs");
	text = stripWrapperTags(text, "CardGroup");
	text = stripWrapperTags(text, "CodeGroup");

	text = formatHeadingBlocks(text, "Step", "Step");
	text = formatHeadingBlocks(text, "Tab", "Tab");
	text = formatCards(text);

	text = applyCallouts(text, "Tip");
	text = applyCallouts(text, "Note");
	text = applyCallouts(text, "Warning");
	text = applyCallouts(text, "Info");
	text = applyCallouts(text, "Callout");

	// Anything left is a component with no Markdown equivalent. Keep the text it
	// wraps, drop the tags.
	text = text
		.replace(/<[A-Z][A-Za-z0-9]*[^>]*\/>/g, "")
		.replace(/<[A-Z][A-Za-z0-9]*[^>]*>/g, "")
		.replace(/<\/[A-Z][A-Za-z0-9]*>/g, "");
	text = text.replace(/\n{3,}/g, "\n\n");

	return restore(text).trim();
}

/**
 * Every `examples/...` path a page embeds, in source order and deduplicated.
 * Drives the Examples section of each skill.
 */
export function listSnippetFiles(body: string): string[] {
	const files: string[] = [];
	for (const match of body.matchAll(CODE_SNIPPET)) {
		const file = attributeValue(match[1] ?? "", "file");
		if (file && !files.includes(file)) files.push(file);
	}
	return files;
}

const CODE_SNIPPET = /<CodeSnippet\s([^>]*?)\/>/g;

export function inlineCodeSnippets(body: string, options: ConvertOptions) {
	return body.replace(CODE_SNIPPET, (_match, rawAttrs: string) => {
		const file = attributeValue(rawAttrs, "file");
		if (!file) return "";
		if (!options.snippetRoot) return "";

		const region = attributeValue(rawAttrs, "region");
		const title = attributeValue(rawAttrs, "title") ?? file;
		let snippet: { lang: string; value: string };
		try {
			snippet = loadSnippet(options.snippetRoot, file, region);
		} catch (error) {
			throw new Error(
				`${options.sourceLabel ?? "page"}: ${(error as Error).message}`,
			);
		}

		return `\n${title}:\n\n\`\`\`${snippet.lang}\n${snippet.value}\n\`\`\`\n`;
	});
}

function maskCodeBlocks(input: string) {
	const blocks: string[] = [];
	const replaced = input.replace(/```[\s\S]*?```/g, (match) => {
		const token = `@@CODE_BLOCK_${blocks.length}@@`;
		blocks.push(match);
		return token;
	});

	return {
		replaced,
		restore: (value: string) =>
			value.replace(
				/@@CODE_BLOCK_(\d+)@@/g,
				(_, index) => blocks[Number(index)] ?? "",
			),
	};
}

function stripWrapperTags(input: string, tag: string) {
	const open = new RegExp(`<${tag}[^>]*>`, "gi");
	const close = new RegExp(`</${tag}>`, "gi");
	return input.replace(open, "\n").replace(close, "\n");
}

function formatHeadingBlocks(input: string, tag: string, fallback: string) {
	const withTitles = input.replace(
		new RegExp(`<${tag}[^>]*title=(?:"([^"]+)"|'([^']+)')[^>]*>`, "gi"),
		(_, doubleQuoted, singleQuoted) =>
			`\n### ${(doubleQuoted ?? singleQuoted ?? fallback).trim()}\n\n`,
	);
	const withFallback = withTitles.replace(
		new RegExp(`<${tag}[^>]*>`, "gi"),
		`\n### ${fallback}\n\n`,
	);
	return withFallback.replace(new RegExp(`</${tag}>`, "gi"), "\n");
}

function formatCards(input: string) {
	return input.replace(
		/<Card([^>]*)>([\s\S]*?)<\/Card>/gi,
		(_, attrs: string, content: string) => {
			const title = attributeValue(attrs, "title") ?? "Resource";
			const href = attributeValue(attrs, "href");
			const summary = collapseWhitespace(stripHtml(content));
			const link = href ? `[${title}](${href})` : title;
			const suffix = summary ? ` — ${summary}` : "";
			return `\n- ${link}${suffix}\n\n`;
		},
	);
}

function applyCallouts(input: string, tag: string) {
	const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "gi");
	return input.replace(regex, (_, content: string) => {
		const text = collapseWhitespace(stripHtml(content));
		return `\n> **${tag.toUpperCase()}:** ${text}\n\n`;
	});
}

function attributeValue(attrs: string, name: string) {
	const match = attrs.match(
		new RegExp(`(?:^|\\s)${name}=(?:"([^"]*)"|'([^']*)')`, "i"),
	);
	if (!match) return undefined;
	return (match[1] ?? match[2] ?? "").trim();
}

function stripHtml(value: string) {
	return value
		.replace(/<[^>]+>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function collapseWhitespace(value: string) {
	return value.replace(/\s+/g, " ").trim();
}
