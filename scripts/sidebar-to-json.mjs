/**
 * One-shot converter: turns a TypeScript sidebar module into the `sidebar.json`
 * a product bundle ships.
 *
 * Sidebars are authored in product repos, which must not depend on the website's
 * icon package, so icons travel as export names ("faSqlite") and the website
 * maps them back at render time.
 *
 * This works on the source text rather than importing the module. `@rivet-gg/icons`
 * re-exports Font Awesome Pro icons that are not installed here, so a wildcard
 * import blows up on the first unresolvable one — even though the site builds
 * fine, because Vite only resolves the icons actually imported.
 *
 *   node scripts/sidebar-to-json.mjs <module.ts> <docsExport> <tutorialsExport|-> <out.json>
 */
import { readFileSync, writeFileSync } from "node:fs";

const [modulePath, docsExport, tutorialsExport, outPath] = process.argv.slice(2);
if (!modulePath || !docsExport || !outPath) {
	console.error(
		"usage: sidebar-to-json.mjs <module.ts> <docsExport> <tutorialsExport|-> <out.json>",
	);
	process.exit(1);
}

const source = readFileSync(modulePath, "utf-8");

/** Pull `export const <name>: SidebarItem[] = [ ... ];` out of the source. */
function extractArray(name) {
	const start = source.indexOf(`export const ${name}`);
	if (start === -1) throw new Error(`export "${name}" not found in ${modulePath}`);
	// Skip past the type annotation, whose `SidebarItem[]` would otherwise match
	// as the array literal.
	const assign = source.indexOf("=", start);
	if (assign === -1) throw new Error(`no assignment for "${name}"`);
	const open = source.indexOf("[", assign);
	if (open === -1) throw new Error(`no array literal for "${name}"`);

	let depth = 0;
	for (let i = open; i < source.length; i++) {
		const ch = source[i];
		if (ch === "[") depth++;
		else if (ch === "]") {
			depth--;
			if (depth === 0) return source.slice(open, i + 1);
		}
	}
	throw new Error(`unbalanced array literal for "${name}"`);
}

function toData(literal) {
	// Icons are bare identifiers in TS; carry them as their export name.
	const quoted = literal.replace(/\bicon:\s*(fa[A-Za-z0-9]+)/g, 'icon: "$1"');
	// Our own source, already narrowed to a data-only literal.
	// biome-ignore lint/security/noGlobalEval: build-time transform of repo source
	return eval(`(${quoted})`);
}

const sidebar = {
	docs: toData(extractArray(docsExport)),
	...(tutorialsExport && tutorialsExport !== "-"
		? { tutorials: toData(extractArray(tutorialsExport)) }
		: {}),
};

// Every icon must have survived as a string; a leftover object means the regex
// missed a shape and the bundle would ship an unusable icon.
function checkIcons(node, path = "") {
	if (Array.isArray(node)) return node.forEach((n, i) => checkIcons(n, `${path}[${i}]`));
	if (!node || typeof node !== "object") return;
	for (const [key, value] of Object.entries(node)) {
		if (key === "icon" && typeof value !== "string") {
			throw new Error(`icon at ${path} did not convert to a name: ${JSON.stringify(value)}`);
		}
		checkIcons(value, `${path}.${key}`);
	}
}
checkIcons(sidebar);

writeFileSync(outPath, `${JSON.stringify(sidebar, null, "\t")}\n`);
console.log(
	`wrote ${outPath} — docs: ${sidebar.docs.length} sections, tutorials: ${sidebar.tutorials?.length ?? 0}`,
);
