// Secure Exec — technical code-snippet image (dark, 2048px wide, auto height).
// The horizontal Secure Exec wordmark over N syntax-highlighted steps in a
// two-column grid, each in a chrome-bordered panel. Landscape, so it sits well
// in a post or a social card. This is the Secure Exec treatment rather than the
// Rivet paper one: secureexec.dev is a dark, chrome-trimmed page, so its
// launch art matches it. Steps come from ./snippets-secure-exec.json.
//
//   node .claude/skills/launch-graphics/graphics/render-secure-exec-technical.mjs
//
// Requires `shiki` (a dev-only highlighter, NOT a repo dependency). Resolved
// from the repo's node_modules, else set SHIKI_DIR=/path/to/shiki, else
// `pnpm add -D shiki`.
import { createRequire } from "node:module";
import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(SCRIPT_DIR, "../../../..");
const CHROMIUM = "/usr/bin/chromium";
const OUT_DIR = process.argv[2] || path.join(os.homedir(), "tmp/secure-exec-graphics");
const WIDTH = 1280;

// The page's own surfaces (website/src/components/marketing/secure-exec).
const PAGE_BG = "#09090b";
const PANEL_BG = "#0c0c0e";

async function findPkg(name) {
	const stores = [path.join(REPO, "node_modules/.pnpm"), process.env.SHIKI_DIR && path.dirname(path.dirname(process.env.SHIKI_DIR))].filter(Boolean);
	for (const pnpm of stores) {
		try {
			const dir = (await readdir(pnpm)).find((d) => new RegExp(`^${name}@`).test(d));
			if (dir) return path.join(pnpm, dir, "node_modules", name);
		} catch {}
	}
	if (name === "shiki" && process.env.SHIKI_DIR) return process.env.SHIKI_DIR;
	return null;
}

const pwDir = await findPkg("playwright");
if (!pwDir) throw new Error("playwright not found under node_modules/.pnpm — run `pnpm install`");
const { chromium } = require(pwDir);

const shikiDir = await findPkg("shiki");
if (!shikiDir) throw new Error("shiki not found — `pnpm add -D shiki` or set SHIKI_DIR=/path/to/node_modules/shiki");
const { getSingletonHighlighter } = await import(path.join(shikiDir, "dist/index.mjs"));
const { default: ayuDark } = await import(path.join(shikiDir, "dist/themes/ayu-dark.mjs"));

// Ayu Dark with the panel background remapped to the page's own panel color.
const theme = structuredClone(ayuDark);
theme.name = "ayu-dark-secure-exec";
for (const k in theme.colors ?? {}) if (theme.colors[k] === "#0b0e14") theme.colors[k] = PANEL_BG;
for (const tc of theme.tokenColors ?? []) for (const k in tc.settings ?? {}) if (tc.settings[k] === "#0b0e14") tc.settings[k] = PANEL_BG;

const dataUrl = (mime, bytes) => `data:${mime};base64,${bytes.toString("base64")}`;
const escapeHtml = (v) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const [monoFont, sansFont, wordmarkImg, reaperImg, handImg, sectionsRaw] = await Promise.all([
	readFile(path.join(REPO, "public/fonts/jetbrains-mono/JetBrainsMono-Variable-latin.woff2")),
	readFile(path.join(REPO, "public/fonts/manrope/Manrope-Variable-latin.woff2")),
	// Horizontal chrome wordmark, built in assets/ from the stacked hero mark:
	// the two words were separated along the trough between them and re-laid out
	// to the spacing of the flat horizontal wordmark.
	readFile(path.join(SCRIPT_DIR, "assets/secure-exec-wordmark-chrome.png")),
	// The reaper leans over the first panel the way it leans over the
	// benchmarks card on the page: the body behind the panel, the hand in
	// front of it, both at the same size and offset.
	readFile(path.join(REPO, "public/images/secure-exec/grim-reaper.webp")),
	readFile(path.join(REPO, "public/images/secure-exec/grim-hand.png")),
	readFile(path.join(SCRIPT_DIR, "snippets-secure-exec.json"), "utf8"),
]);
const sections = JSON.parse(sectionsRaw);

const highlighter = await getSingletonHighlighter({
	langs: [...new Set(sections.map((s) => s.language))],
	themes: [theme],
});
const renderedSections = sections
	.map(({ title, language, code }, i) => {
		const highlighted = highlighter.codeToHtml(code, { lang: language, theme: theme.name });
		// Each panel gets its own gradient start angle, the way the page varies
		// `--chrome-angle` per card so neighbouring borders do not mirror.
		const angle = 110 + i * 70;
		// Index 1 is the top of the right column, so the reaper hangs off the
		// top-right panel — the same corner it takes on the benchmarks card.
		const reaper =
			i === (sections.length > 1 ? 1 : 0)
				? `<img class="reaper" alt="" src="${dataUrl("image/webp", reaperImg)}" />
					<img class="reaper hand" alt="" src="${dataUrl("image/png", handImg)}" />`
				: "";
		const heading = title ? `<h2>${escapeHtml(title)}</h2>` : "";
		return `<section class="section">${reaper}${heading}
			<div class="code-block" style="--chrome-angle:${angle}deg"><div class="code-inner">${highlighted}</div></div></section>`;
	})
	.join("\n");

// The chrome ring: the page's conic gradient, masked to the padding box so only
// the border shows. Scaled up from the site's 1px to read at 2048px wide.
const CHROME_GRADIENT = `conic-gradient(
	from var(--chrome-angle),
	#5c6a7a 0%, #8b7d6b 5%, #f0f0f0 11%,
	#6a7e94 16%, #a09888 21%, #ffffff 27%,
	#4a5a6a 32%, #5e4f40 37%, #d8dce0 43%,
	#8896a4 48%, #a89880 53%, #ffffff 59%,
	#7a8a9c 64%, #b8b0a4 69%, #f8f8f8 75%,
	#506070 80%, #c4beb4 85%, #e8e4e0 90%,
	#6e7c8a 94%, #8a7c6c 97%, #b0a898 100%
)`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8" />
	<meta name="viewport" content="width=${WIDTH}, initial-scale=1" /><style>
	@font-face { font-family:"JetBrains Mono"; src:url("${dataUrl("font/woff2", monoFont)}") format("woff2"); font-weight:100 800; }
	@font-face { font-family:"Manrope"; src:url("${dataUrl("font/woff2", sansFont)}") format("woff2"); font-weight:200 800; }
	* { box-sizing:border-box; }
	html, body { margin:0; width:${WIDTH}px; height:auto; overflow-x:hidden; background:${PAGE_BG}; }
	.card { position:relative; width:${WIDTH}px; height:auto; padding:56px 116px 72px; background:${PAGE_BG}; }
	.header { display:flex; align-items:center; height:86px; }
	/* White-on-transparent wordmark, used as its own silhouette. */
	.wordmark { height:86px; width:auto; display:block; }
	.sections { display:grid; grid-template-columns:${sections.length === 1 ? "minmax(0,1fr)" : "repeat(2, minmax(0,1fr))"}; gap:36px 36px; margin-top:52px; align-items:start; }
	.section { position:relative; z-index:0; display:flex; min-width:0; flex-direction:column; }
	/* The first panel stands alone in the left column; the rest stack on the right. */
	${sections.length > 1 ? `.section:first-child { grid-column:1; grid-row:1 / span ${sections.length - 1}; }` : ""}
	.reaper { position:absolute; right:-106px; top:-150px; width:272px; height:auto; z-index:0; filter:drop-shadow(0 0 30px rgba(0,0,0,0.8)); }
	.reaper.hand { z-index:2; filter:none; }
	.section h2 { margin:0 0 14px; color:#fff; font-family:"Manrope",sans-serif; font-size:23px; font-weight:500; line-height:34px; letter-spacing:-0.01em; }
	.code-block { position:relative; z-index:1; flex:1; overflow:hidden; border-radius:24px; background:${PANEL_BG}; box-shadow:inset 0 0 0 4px rgba(0,0,0,0.85); }
	.code-block::before {
		content:""; position:absolute; inset:0; border-radius:inherit; padding:4px;
		background:${CHROME_GRADIENT};
		filter:drop-shadow(0 0 24px rgba(255,255,255,0.16)) drop-shadow(0 0 48px rgba(255,255,255,0.08));
		-webkit-mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		-webkit-mask-composite:xor; mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		mask-composite:exclude; pointer-events:none;
	}
	.code-inner { position:relative; padding:26px 28px; }
	.shiki { margin:0; padding:0; background:transparent !important; font-family:"JetBrains Mono",monospace; font-size:20px; font-weight:400; line-height:28px; tab-size:4; }
	.shiki code { display:block; }
</style></head><body>
	<main class="card">
		<header class="header">
			<img class="wordmark" alt="Secure Exec" src="${dataUrl("image/png", wordmarkImg)}" />
		</header>
		<div class="sections">${renderedSections}</div>
	</main>
</body></html>`;

await mkdir(OUT_DIR, { recursive: true });
await writeFile(path.join(OUT_DIR, "technical.html"), html);

const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM });
try {
	const page = await browser.newPage({ viewport: { width: WIDTH, height: 1238 }, deviceScaleFactor: 1 });
	await page.setContent(html, { waitUntil: "load" });
	await page.evaluate(() => document.fonts.ready);
	const height = await page.$eval(".card", (c) => Math.ceil(c.getBoundingClientRect().height));
	await page.setViewportSize({ width: WIDTH, height });
	const overflow = await page.$$eval(".code-block", (blocks) =>
		blocks.map((b, i) => ({ i, o: b.scrollWidth - b.clientWidth })).find(({ o }) => o > 1),
	);
	if (overflow) throw new Error(`Code section ${overflow.i + 1} overflows by ${Math.ceil(overflow.o)}px — shorten it`);
	await page.screenshot({ path: path.join(OUT_DIR, "technical.png"), fullPage: false });
	await page.close();
} finally {
	await browser.close();
}
console.log(`wrote ${path.join(OUT_DIR, "technical.png")}`);
