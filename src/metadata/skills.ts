/**
 * One AI skill per product, generated entirely from the docs.
 *
 * A skill is frontmatter, an index of links to the Markdown mirror of that
 * product's docs, and the examples those docs embed. There is no hand-written
 * skill prose anywhere: to change what a skill says, change the docs.
 *
 * Published to https://github.com/rivet-dev/skills by
 * `.github/workflows/skills.yml`, and served from `/metadata/skills/<name>/`.
 */
import { existsSync } from "node:fs";
import path from "node:path";

// The `.ts` extension is load-bearing: Node resolves a relative specifier
// ending in `.node` as a native addon, so `pnpm gen:markdown` / `gen:skills`
// (plain tsx, no bundler) cannot find this module without it.
import { docsRoot } from "../sitemap/docs-sources.node.ts";
import { VISIBLE_PRODUCTS } from "../sitemap/product-metadata";
import {
	examplesRepoFor,
	listDocPages,
	snippetRootFor,
	type DocPage,
} from "./docs-index";
import { SITE_BASE_URL } from "./shared";

export interface SkillExample {
	/** Repo-root-relative path, e.g. `examples/docs/actors-keys`. */
	path: string;
	/** Absolute path on disk, for shipping the example with the skill. */
	sourcePath: string;
	url: string;
}

export interface Skill {
	/** Directory name in the skills repo, and the `name:` in the frontmatter. */
	name: string;
	product: string;
	description: string;
	docs: DocPage[];
	examples: SkillExample[];
	/** Absolute path to an OpenAPI document to ship beside the skill, if any. */
	openApiPath?: string;
}

/** Skill directory for a product. Namespaced so it reads as Rivet's in a
 * shared skills directory. */
export function skillName(product: string) {
	return `rivet-${product}`;
}

export function listSkills(): Skill[] {
	const pages = listDocPages();

	return VISIBLE_PRODUCTS.map((product) => {
		const docs = pages
			.filter((page) => page.product === product.id)
			.sort((a, b) => a.slug.localeCompare(b.slug));

		if (docs.length === 0) {
			throw new Error(
				`No docs found for "${product.id}"; a skill would be empty. ` +
					`Run \`pnpm assemble\`.`,
			);
		}

		const description = `${product.name}: ${product.tagline}.`;
		if (description.length > 500) {
			throw new Error(
				`Skill description must be <= 500 chars for ${product.id}, got ${description.length}. ` +
					`Shorten the tagline in src/sitemap/product-metadata.ts.`,
			);
		}

		const openApi = path.join(
			docsRoot(product.id) ?? "",
			"rivetkit-openapi/openapi.json",
		);

		return {
			name: skillName(product.id),
			product: product.id,
			description: `${product.name}: ${product.tagline}.`,
			docs,
			examples: collectExamples(product.id, docs),
			openApiPath: existsSync(openApi) ? openApi : undefined,
		};
	});
}

export function renderSkill(skill: Skill): string {
	// Both values are quoted: taglines contain colons, which YAML would otherwise
	// read as a mapping.
	const lines = [
		"---",
		`name: ${JSON.stringify(skill.name)}`,
		`description: ${JSON.stringify(skill.description)}`,
		"---",
		"",
		"## Documentation",
		"",
		...skill.docs.map(
			(page) => `- [${page.title}](${SITE_BASE_URL}/${page.slug}.md)`,
		),
	];

	if (skill.examples.length > 0) {
		lines.push(
			"",
			"## Examples",
			"",
			"Runnable code the documentation above embeds, mirrored under `examples/` in this skill directory.",
			"",
			...skill.examples.map(
				(example) => `- [${example.path}](${example.url})`,
			),
		);
	}

	if (skill.openApiPath) {
		lines.push(
			"",
			"## API Reference",
			"",
			"- [openapi.json](openapi.json)",
		);
	}

	return `${lines.join("\n")}\n`;
}

/**
 * The examples a product's docs embed, as whole example directories.
 *
 * Docs reference individual files (`examples/docs/actors-keys/key-format.ts`),
 * but a skill wants the surrounding project. The example is the first path
 * segment under `examples/`, except under `examples/docs/`: that is one package
 * holding a directory per docs topic, so descend a level and take the topic.
 */
function collectExamples(product: string, docs: DocPage[]): SkillExample[] {
	const root = snippetRootFor(product);
	if (!root) return [];
	const repo = examplesRepoFor(product);

	const paths = new Set<string>();
	for (const page of docs) {
		for (const file of page.snippetFiles) {
			const segments = file.split("/").filter(Boolean);
			if (segments[0] !== "examples") continue;
			const depth = segments[1] === "docs" ? 3 : 2;
			if (segments.length <= depth) continue;
			paths.add(segments.slice(0, depth).join("/"));
		}
	}

	return [...paths]
		.sort()
		.map((relative) => ({
			path: relative,
			sourcePath: path.join(root, relative),
			url: `https://github.com/${repo}/tree/main/${relative}`,
		}))
		.filter((example) => existsSync(example.sourcePath));
}
