/**
 * Links each product's docs into the content collection.
 *
 * Astro content collections are path-based, so every product's MDX has to live
 * under one base (`src/content/docs`). Products own their docs in their own
 * repos, so this symlinks each one in:
 *
 *   src/content/docs/<product>  ->  <repo>/docs/content
 *
 * Target resolution: sibling checkout (`../<repo>`) first, then the committed
 * `vendor/<product>` bundle. Snippets are NOT linked — the remark plugin reads
 * them straight from the resolved repo root.
 *
 * The links are gitignored, which makes the symlink itself the override: point
 * one somewhere else with `ln -sfn` and this script will leave it alone.
 *
 *   node scripts/assemble.mjs           link what is missing, keep overrides
 *   node scripts/assemble.mjs --force   reset every link to its default
 */
import {
	existsSync,
	lstatSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	readlinkSync,
	realpathSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import path from "node:path";
import { PRODUCTS, ownsDocsBundle } from "../src/sitemap/product-metadata";
import { DOCS_SOURCES, SITE_DOCS_NAMESPACE } from "../src/sitemap/docs-sources";
import { fileURLToPath } from "node:url";

const REPO_ROOT = fileURLToPath(new URL("..", import.meta.url));
const CONTENT_BASE = path.join(REPO_ROOT, "src/content/docs");

// Runs under tsx so the product list comes from the one metadata file rather
// than being duplicated here.
const BUNDLES = Object.fromEntries(
	PRODUCTS.filter(ownsDocsBundle).map((product) => {
		// A product serving another's bundle (`bundleOf`) links to the
		// same source; its routes differ, its content does not.
		const source = product.bundleOf
			? PRODUCTS.find((candidate) => candidate.id === product.bundleOf)
			: product;
		if (!source) {
			throw new Error(`${product.id}: bundleOf "${product.bundleOf}" is not a product`);
		}
		return [
			product.id,
			{
				sourceId: source.id,
				repo: source.repo,
				localBundle: source.localBundle,
				bundlePath: source.bundlePath ?? "docs",
			},
		];
	}),
);

// The product-agnostic docs at `/docs/` are not a product vertical, so they are
// not in PRODUCTS, but they are a bundle in a product repo like any other. The
// namespace has no tab dimension, so its bundle content is flat and links in
// exactly like a product's does.
BUNDLES[SITE_DOCS_NAMESPACE] = {
	sourceId: SITE_DOCS_NAMESPACE,
	repo: DOCS_SOURCES[SITE_DOCS_NAMESPACE].repo,
	localBundle: DOCS_SOURCES[SITE_DOCS_NAMESPACE].localBundle,
	bundlePath: DOCS_SOURCES[SITE_DOCS_NAMESPACE].bundlePath ?? "docs",
};

const force = process.argv.includes("--force");

/** Where a product's docs should come from, and how we found it. */
function resolveTarget(productId, repo, localBundle, bundlePath = "docs") {
	// A bundle in this repo has no sibling to prefer and no override to respect.
	if (localBundle) {
		const local = path.resolve(REPO_ROOT, localBundle, bundlePath, "content");
		return existsSync(local)
			? { target: local, via: "in-repo" }
			: { target: null, via: "missing" };
	}

	const sibling = path.resolve(REPO_ROOT, "..", repo, bundlePath, "content");
	if (existsSync(sibling)) return { target: sibling, via: "sibling" };

	const vendored = path.resolve(REPO_ROOT, "vendor", productId, "docs/content");
	if (existsSync(vendored)) return { target: vendored, via: "vendor" };

	return { target: null, via: "missing" };
}

function describe(linkPath) {
	try {
		const stat = lstatSync(linkPath);
		if (!stat.isSymbolicLink()) return { kind: "real" };
		const dest = path.resolve(path.dirname(linkPath), readlinkSync(linkPath));
		return { kind: existsSync(dest) ? "link" : "dangling", dest };
	} catch {
		return { kind: "none" };
	}
}

mkdirSync(CONTENT_BASE, { recursive: true });

const rows = [];
const problems = [];

for (const [productId, { sourceId, repo, localBundle, bundlePath }] of Object.entries(
	BUNDLES,
)) {
	const linkPath = path.join(CONTENT_BASE, productId);
	const current = describe(linkPath);
	const { target, via } = resolveTarget(sourceId, repo, localBundle, bundlePath);

	// An in-repo bundle is always relinked: there is nothing to override it with,
	// so a stale link here is a mistake rather than a choice.
	if (localBundle && target) {
		if (current.kind !== "none") rmSync(linkPath, { recursive: true, force: true });
		symlinkSync(path.relative(CONTENT_BASE, target), linkPath, "dir");
		rows.push([productId, target, via]);
		continue;
	}

	// A real directory here means someone committed content that should live in
	// a product repo. Refuse rather than silently deleting their work.
	if (current.kind === "real") {
		problems.push(
			`${productId}: src/content/docs/${productId} is a real directory, not a link. ` +
				`Product docs belong in the ${repo} repo; move them there and re-run.`,
		);
		continue;
	}

	// Respect a manual override: an existing, resolving link is left alone.
	if (current.kind === "link" && !force) {
		const overridden = current.dest !== target;
		rows.push([productId, current.dest, overridden ? "override" : via]);
		continue;
	}

	if (!target) {
		problems.push(
			`${productId}: no docs source. Clone the ${repo} repo next to this one ` +
				`(${path.resolve(REPO_ROOT, "..", repo, bundlePath ?? "docs")}) or add ` +
					`vendor/${sourceId}/docs/content.`,
		);
		continue;
	}

	if (current.kind !== "none") rmSync(linkPath, { recursive: true, force: true });
	symlinkSync(path.relative(CONTENT_BASE, target), linkPath, "dir");
	rows.push([productId, target, current.kind === "dangling" ? `${via} (repaired)` : via]);
}

const width = Math.max(...rows.map(([id]) => id.length), 8);
console.log("docs sources:");
for (const [id, dest, via] of rows) {
	console.log(`  ${id.padEnd(width)}  ${path.relative(REPO_ROOT, dest) || dest}  (${via})`);
}

if (problems.length > 0) {
	console.error("\nassemble failed:");
	for (const problem of problems) console.error(`  - ${problem}`);
	process.exit(1);
}

// ---------------------------------------------------------------------------
// Collect each bundle's sidebar into the generated tree.
//
// Sidebars ship as JSON with icons as export names, because product repos must
// not depend on the website's icon package. The names are resolved back to
// IconDefinitions through a generated module that imports only the icons
// actually referenced — a wildcard import would try to resolve every Font
// Awesome Pro re-export, which are not installed here.
// ---------------------------------------------------------------------------
const GENERATED = path.join(REPO_ROOT, "src/generated");
mkdirSync(GENERATED, { recursive: true });

const sidebars = {};
const iconNames = new Set();

function collectIcons(node) {
	if (Array.isArray(node)) return node.forEach(collectIcons);
	if (!node || typeof node !== "object") return;
	if (typeof node.icon === "string") iconNames.add(node.icon);
	for (const value of Object.values(node)) collectIcons(value);
}

for (const [productId] of Object.entries(BUNDLES)) {
	// The content link points at <repo>/docs/content; the sidebar sits beside it.
	const contentLink = path.join(CONTENT_BASE, productId);
	const sidebarPath = path.resolve(path.dirname(realpathSync(contentLink)), "sidebar.json");
	if (!existsSync(sidebarPath)) {
		console.error(`\nassemble failed:\n  - ${productId}: missing ${sidebarPath}`);
		process.exit(1);
	}
	const sidebar = JSON.parse(readFileSync(sidebarPath, "utf-8"));
	sidebars[productId] = sidebar;
	collectIcons(sidebar);
}

writeFileSync(
	path.join(GENERATED, "sidebars.json"),
	`${JSON.stringify(sidebars, null, "\t")}\n`,
);

const sorted = [...iconNames].sort();
writeFileSync(
	path.join(GENERATED, "sidebar-icons.ts"),
	`// Generated by scripts/assemble.mjs. Do not edit.\n` +
		`// Only the icons referenced by product sidebars, so the bundle never has to\n` +
		`// resolve the whole @rivet-gg/icons surface.\n` +
		`import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";\n` +
		`import { ${sorted.join(", ")} } from "@rivet-gg/icons";\n\n` +
		`export const SIDEBAR_ICONS: Record<string, IconDefinition> = {\n` +
		sorted.map((n) => `\t${n},`).join("\n") +
		`\n};\n`,
);

console.log(`generated sidebars.json and sidebar-icons.ts (${sorted.length} icons)`);

// ---------------------------------------------------------------------------
// Copy the generated config schemas the docs render.
//
// These are build artifacts of the Rivet repo, not docs, so they are pulled in
// rather than committed here. Components import them from src/generated because
// a static relative import cannot reach a path that moves with the checkout.
// ---------------------------------------------------------------------------
const ARTIFACTS: Array<[product: string, from: string, to: string]> = [
	["actors", "rivetkit-typescript/artifacts/actor-config.json", "actor-config.json"],
	["actors", "rivetkit-typescript/artifacts/registry-config.json", "registry-config.json"],
	// Control-plane config, so it ships with the product-agnostic bundle.
	[SITE_DOCS_NAMESPACE, "engine/artifacts/config-schema.json", "engine-config-schema.json"],
	// agentOS software catalog, generated in that repo by scripts/gen-registry.mjs.
	["agentos", "docs/registry.json", "registry.json"],
];

// The repo root behind a bundle link. The link points at `<root>/<bundle>/content`,
// so walk back out by however many segments the bundle path has. A vendored
// bundle is always normalized to `vendor/<product>/docs`, whatever the product's
// own bundle path is, so it walks back one.
const productRoot = (productId: string) => {
	const contentDir = realpathSync(path.join(CONTENT_BASE, productId));
	const bundleRoot = path.resolve(contentDir, "..");
	const vendorRoot = path.resolve(bundleRoot, "..");
	if (vendorRoot === path.resolve(REPO_ROOT, "vendor", productId)) return vendorRoot;
	const depth = (BUNDLES[productId]?.bundlePath ?? "docs").split("/").length;
	return path.resolve(bundleRoot, ...Array(depth).fill(".."));
};

const artifactsDir = path.join(GENERATED, "artifacts");
mkdirSync(artifactsDir, { recursive: true });

for (const [productId, from, to] of ARTIFACTS) {
	const root = productRoot(productId);
	const src = path.join(root, from);
	if (!existsSync(src)) {
		console.error(
			`\nassemble failed:\n  - missing ${from} in the ${productId} repo (${root}). ` +
				`It is a generated artifact; build it there first.`,
		);
		process.exit(1);
	}
	writeFileSync(path.join(artifactsDir, to), readFileSync(src));
}

console.log(`copied ${ARTIFACTS.length} generated artifacts from the product repos`);

// ---------------------------------------------------------------------------
// Copy each bundle's public assets.
//
// A bundle may ship images its docs or data reference by absolute path (the
// agentOS software catalog does). Existing files win, so a product can never
// clobber a website asset.
// ---------------------------------------------------------------------------
let assetCount = 0;
for (const productId of Object.keys(BUNDLES)) {
	const from = path.join(
		productRoot(productId),
		BUNDLES[productId]?.bundlePath ?? "docs",
		"public",
	);
	if (!existsSync(from)) continue;
	const walk = (dir: string) => {
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			const src = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				walk(src);
				continue;
			}
			const dest = path.join(REPO_ROOT, "public", path.relative(from, src));
			if (existsSync(dest)) continue;
			mkdirSync(path.dirname(dest), { recursive: true });
			writeFileSync(dest, readFileSync(src));
			assetCount++;
		}
	};
	walk(from);
}
if (assetCount > 0) console.log(`copied ${assetCount} bundle assets into public/`);
