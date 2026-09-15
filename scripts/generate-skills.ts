/**
 * Writes the product skills and a combined Rivet skill into
 * `public/metadata/skills/<name>/`, plus its well-known discovery index.
 *
 *   SKILL.md      frontmatter, the doc index, the example index
 *   examples/**   the example projects the docs embed
 *   openapi.json  shipped for the products whose repo publishes one
 *
 * Astro copies `public/` into `dist/` verbatim, so the same tree is served at
 * https://rivet.dev/metadata/skills/<name>/ and published to
 * https://github.com/rivet-dev/skills.
 *
 * Run by `prebuild`; safe to run on its own with `pnpm gen:skills`.
 */
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { PROJECT_ROOT, SITE_BASE_URL } from "../src/metadata/shared";
import { listSkills, renderMetaSkill, renderSkill } from "../src/metadata/skills";

const OUTPUT_DIR = path.join(PROJECT_ROOT, "public/metadata/skills");
const DISCOVERY_DIR = path.join(PROJECT_ROOT, "public/.well-known/agent-skills");

/** Build output and dependencies never belong in a published example. */
const EXCLUDED = new Set([
	"node_modules",
	"dist",
	"build",
	".turbo",
	".astro",
	".next",
	".git",
]);

async function main() {
	// Fully generated, so replace rather than merge: a renamed skill or a
	// dropped example has to disappear downstream.
	await fs.rm(OUTPUT_DIR, { recursive: true, force: true });

	const skills = listSkills();
	for (const skill of skills) {
		const skillDir = path.join(OUTPUT_DIR, skill.name);
		await fs.mkdir(skillDir, { recursive: true });
		await fs.writeFile(path.join(skillDir, "SKILL.md"), renderSkill(skill));

		for (const example of skill.examples) {
			await copyExample(example.sourcePath, path.join(skillDir, example.path));
		}

		if (skill.openApiPath) {
			await fs.copyFile(
				skill.openApiPath,
				path.join(skillDir, "openapi.json"),
			);
		}

		console.log(
			`${skill.name}: ${skill.docs.length} docs, ${skill.examples.length} examples` +
				`${skill.openApiPath ? ", openapi.json" : ""}`,
		);
	}

	const metaSkill = renderMetaSkill(skills);
	const metaDir = path.join(OUTPUT_DIR, metaSkill.name);
	await fs.mkdir(metaDir, { recursive: true });
	await fs.writeFile(path.join(metaDir, "SKILL.md"), metaSkill.content);
	await fs.mkdir(DISCOVERY_DIR, { recursive: true });
	await fs.writeFile(
		path.join(DISCOVERY_DIR, "index.json"),
		`${JSON.stringify(
			{
				$schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
				skills: [
					{
						name: metaSkill.name,
						type: "skill-md",
						description: metaSkill.description,
						url: `${SITE_BASE_URL}/metadata/skills/${metaSkill.name}/SKILL.md`,
						digest: `sha256:${createHash("sha256").update(metaSkill.content).digest("hex")}`,
					},
				],
			},
			null,
			2,
		)}\n`,
	);
	console.log(`${metaSkill.name}: combined ${skills.length} product skills`);
}

async function copyExample(from: string, to: string) {
	await fs.cp(from, to, {
		recursive: true,
		filter: (source) => !EXCLUDED.has(path.basename(source)),
	});
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
