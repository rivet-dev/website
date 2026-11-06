import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

// "Rust SDK for Rivet Actors, Generally Available" hero: the ink Rivet badge × the
// official "rusty" Rust logo (rust-lang/rust-artwork,
// logo/rusty/rust-logo-512x512.png), the title, and an ink "Generally Available" pill.
// Writes image.png (2048x1024), social.png (2048x1238) and scene.html.
//
//   pnpm tsx .claude/skills/create-launch-post/scripts/render-rust-ga-hero.ts \
//     --output-dir /tmp/rust-hero [--browser /path/to/chrome]
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(SCRIPT_DIR, "../../../..");
const ASSETS = path.resolve(SCRIPT_DIR, "../assets/logos");
const CARD_W = 2048;
const CARD_H = 1024;

const INK = "#1B1916";
const INK_SOFT = "#56524A";
const PAPER = "#EFEFEF";

async function buildHtml(): Promise<string> {
	const [font, rust, rivetRaw] = await Promise.all([
		readFile(path.join(REPO, "public/fonts/manrope/Manrope-Variable-latin.woff2")),
		readFile(path.join(ASSETS, "rust-rusty.png")),
		readFile(path.join(REPO, "src/images/rivet-logos/icon-white.svg"), "utf8"),
	]);
	const rivet = rivetRaw
		.replace(/<svg width="128" height="128"/, '<svg viewBox="0 0 128 128"')
		.replace(/#F0F0F0/gi, "#FFFFFF")
		.replace(/#0F0F0F/gi, INK);

	return `<!doctype html><html><head><meta charset="utf-8"><style>
	@font-face { font-family: "Manrope"; src: url("data:font/woff2;base64,${font.toString("base64")}") format("woff2"); font-weight: 200 800; }
	* { box-sizing: border-box; }
	html, body { margin: 0; background: ${PAPER}; }
	.stage { position: relative; width: ${CARD_W}px; height: ${CARD_H}px; overflow: hidden; background: ${PAPER}; }
	.card { position: absolute; left: 0; top: 0; width: ${CARD_W}px; height: ${CARD_H}px; font-family: "Manrope", sans-serif; color: ${INK}; display: flex; flex-direction: column; align-items: center; justify-content: center; }
	.lockup { display: flex; align-items: center; gap: 60px; }
	.rivet { width: 240px; height: 240px; }
	.rivet svg { display: block; width: 100%; height: 100%; }
	.times { font-size: 110px; font-weight: 300; color: ${INK_SOFT}; }
	.rust { display: block; width: 270px; height: 270px; }
	h1 { margin: 76px 0 0; font-size: 120px; line-height: 1; letter-spacing: -0.025em; font-weight: 600; }
	.pill { margin-top: 60px; display: inline-flex; align-items: center; padding: 20px 38px; border-radius: 999px; background: ${INK}; color: #FFFFFF; font-size: 38px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
	</style></head><body><div class="stage" id="stage"><div class="card" id="card">
	<div class="lockup"><div class="rivet">${rivet}</div><div class="times">×</div><img class="rust" src="data:image/png;base64,${rust.toString("base64")}" alt=""></div>
	<h1>Rust SDK for Rivet Actors</h1>
	<div class="pill">Generally Available</div>
	</div></div></body></html>`;
}

function parseArgs(argv: string[]): { outputDir: string; browser?: string } {
	const args = argv[0] === "--" ? argv.slice(1) : argv;
	const opt = (flag: string) => {
		const index = args.indexOf(flag);
		return index >= 0 ? args[index + 1] : undefined;
	};
	const outputDir = opt("--output-dir");
	if (!outputDir) throw new Error("Usage: render-rust-ga-hero.ts --output-dir <path> [--browser <path>]");
	const browser = opt("--browser");
	return { outputDir: path.resolve(outputDir), browser: browser ? path.resolve(browser) : undefined };
}

async function main() {
	const { outputDir: OUT, browser: executablePath } = parseArgs(process.argv.slice(2));
	await mkdir(OUT, { recursive: true });
	const html = await buildHtml();
	await writeFile(path.join(OUT, "scene.html"), html);
	const browser = await chromium.launch({ executablePath });
	for (const target of [
		{ name: "image", w: 2048, h: 1024 },
		{ name: "social", w: 2048, h: 1238 },
	]) {
		const page = await browser.newPage({ viewport: { width: target.w, height: target.h }, deviceScaleFactor: 1 });
		await page.setContent(html, { waitUntil: "load" });
		await page.evaluate(() => document.fonts.ready);
		await page.evaluate((h) => {
			document.getElementById("stage")!.style.height = h + "px";
			document.getElementById("card")!.style.top = Math.round((h - 1024) / 2) + "px";
		}, target.h);
		await page.screenshot({ path: path.join(OUT, `${target.name}.png`) });
		await page.close();
		console.log(`wrote ${target.name}.png`);
	}
	await browser.close();
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
