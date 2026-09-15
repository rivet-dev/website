import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

// Rivet BYOC hero: a colored, simplified hero-scale take on the docs'
// ByocArchitectureDiagram. Writes image.png (2048x1024) and social.png
// (2048x1238) plus scene.html.
//
//   pnpm render-byoc-hero -- --output-dir /tmp/byoc-hero
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(SCRIPT_DIR, "../../../..");
const CARD_W = 2048;
const CARD_H = 1024;

const INK = "#1B1916";
const INK_SOFT = "#56524A";
const PAPER = "#EFEFEF";
const CREAM = "#F4F1E7";
const PINE = "#2E4034";
const SAGE = "#93A286";
const ACCENT = "#CB5A33";
const AWS_ORANGE = "#FF9900";
const GCP_BLUE = "#4285F4";

const strip = (s: string) => s.replace(/<\?xml[^>]*\?>/i, "").replace(/<!DOCTYPE[^>]*>/i, "");
const ensureViewBox = (svg: string) => {
	const open = svg.match(/<svg\b[^>]*>/i)?.[0];
	if (!open || /\bviewBox=/i.test(open)) return svg;
	const w = open.match(/\bwidth="([\d.]+)(px)?"/i)?.[1];
	const h = open.match(/\bheight="([\d.]+)(px)?"/i)?.[1];
	return w && h ? svg.replace(open, open.replace(/<svg\b/i, `<svg viewBox="0 0 ${w} ${h}"`)) : svg;
};
const pathData = (svg: string) => svg.match(/\sd="([^"]+)"/)![1];

// The registry AWS mark is one path: four subpaths for "aws" then two for the
// smile. Split them so the smile can take the brand orange.
function awsMark(svg: string): string {
	const subs = pathData(svg).split("z").filter((s) => s.trim()).map((s) => s + "z");
	const letters = subs.slice(0, 4).join("");
	// Absolute starts of the two smile subpaths, resolved from the relative moves.
	const smile =
		"M578.59 368.94" + subs[4].replace(/^m[\d.\- ]+/, "") +
		"M607.78 335.65" + subs[5].replace(/^m[\d.\- ]+/, "");
	return `<svg viewBox="0 0 640 512" xmlns="http://www.w3.org/2000/svg"><path d="${letters}" fill="${INK}"/><path d="${smile}" fill="${AWS_ORANGE}"/></svg>`;
}

async function buildHtml(): Promise<string> {
	const [font, badgeRaw, awsRaw, gcpRaw] = await Promise.all([
		readFile(path.join(REPO, "public/fonts/manrope/Manrope-Variable-latin.woff2")),
		readFile(path.join(REPO, "src/images/rivet-logos/icon-white.svg"), "utf8"),
		readFile(path.join(REPO, "public/images/registry/deploy-aws-ecs.svg"), "utf8"),
		readFile(path.join(REPO, "public/images/registry/deploy-gcp-cloud-run.svg"), "utf8"),
	]);
	const badge = ensureViewBox(strip(badgeRaw)).replace(/#f0f0f0\b/gi, "#FFFFFF").replace(/#0f0f0f\b/gi, INK);
	const aws = awsMark(strip(awsRaw));
	const gcp = strip(gcpRaw).replace(/fill="#1b1916"/i, `fill="${GCP_BLUE}"`);

	// Diagram geometry in card pixels.
	const num = (x: number, y: number, n: number, stroke = PINE) =>
		`<circle cx="${x}" cy="${y}" r="22" fill="${PAPER}" stroke="${stroke}" stroke-width="2.5"/>
		 <text x="${x}" y="${y + 9}" text-anchor="middle" font-size="26" font-weight="600" fill="${stroke}">${n}</text>`;

	return `<!doctype html><html><head><meta charset="utf-8"><style>
	@font-face { font-family: "Manrope"; src: url("data:font/woff2;base64,${font.toString("base64")}") format("woff2"); font-weight: 200 800; }
	* { box-sizing: border-box; }
	html, body { margin: 0; background: ${PAPER}; }
	.stage { position: relative; width: ${CARD_W}px; height: ${CARD_H}px; overflow: hidden; background: ${PAPER}; }
	.card { position: absolute; left: 0; top: 0; width: ${CARD_W}px; height: ${CARD_H}px; font-family: "Manrope", sans-serif; color: ${INK}; }
	/* No title on the hero; the post title carries it. The diagram is drawn
	   in the coordinates it had under the title and recentred here. */
	.scene { position: absolute; inset: 0; transform: translateY(-68px); }
	svg.diagram { position: absolute; left: 0; top: 0; width: ${CARD_W}px; height: ${CARD_H}px; font-family: "Manrope", sans-serif; }
	.logo { position: absolute; display: flex; align-items: center; justify-content: center; }
	.logo svg { display: block; height: 100%; width: auto; }
	</style></head><body><div class="stage" id="stage"><div class="card" id="card"><div class="scene">
	<svg class="diagram" viewBox="0 0 ${CARD_W} ${CARD_H}" xmlns="http://www.w3.org/2000/svg">
		<defs>
			<marker id="ah-pine" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="${PINE}"/></marker>
			<marker id="ah-accent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="${ACCENT}"/></marker>
		</defs>
		<g fill="${INK}">
			<!-- Your VPC -->
			<rect x="944" y="300" width="900" height="560" rx="30" fill="${SAGE}" fill-opacity="0.18" stroke="${PINE}" stroke-width="3" stroke-dasharray="16 12"/>
			<text x="992" y="366" font-size="32" font-weight="500" fill="${PINE}">Your VPC</text>

			<!-- Rivet Cloud -->
			<rect x="204" y="490" width="380" height="180" rx="22" fill="${INK}"/>
			<text x="394" y="642" text-anchor="middle" font-size="38" font-weight="600" fill="#FFFFFF">Rivet Cloud</text>

			<!-- Outbound only -->
			<path d="M944 580 H590" fill="none" stroke="${ACCENT}" stroke-width="4" marker-end="url(#ah-accent)"/>
			<text x="767" y="548" text-anchor="middle" font-size="26" font-weight="500" fill="${ACCENT}">Outbound only</text>
			<text x="767" y="622" text-anchor="middle" font-size="24" fill="${INK_SOFT}">Updates and status</text>

			<!-- Deployment inside the VPC -->
			<rect x="1024" y="420" width="740" height="380" rx="22" fill="#FFFFFF" fill-opacity="0.7" stroke="${PINE}" stroke-width="2"/>
			<rect x="1064" y="460" width="660" height="88" rx="16" fill="#FFFFFF" stroke="${INK}" stroke-width="2.5"/>
			<text x="1394" y="516" text-anchor="middle" font-size="34" font-weight="600">Rivet operator</text>
			<rect x="1064" y="572" width="660" height="88" rx="16" fill="${PINE}"/>
			<text x="1394" y="628" text-anchor="middle" font-size="34" font-weight="600" fill="${CREAM}">Rivet control plane</text>
			<rect x="1064" y="684" width="660" height="88" rx="16" fill="#FFFFFF" stroke="${INK}" stroke-width="2.5"/>
			<text x="1394" y="740" text-anchor="middle" font-size="34" font-weight="600">FoundationDB</text>
			<text x="1394" y="836" text-anchor="middle" font-size="24" fill="${INK_SOFT}">Managed by Rivet</text>
		</g>
	</svg>
	<!-- Rivet badge on the Rivet Cloud card -->
	<div class="logo" style="left:364px;top:522px;width:60px;height:60px">${badge}</div>
	<!-- Provider marks, top-right of the VPC -->
	<div class="logo" style="left:1636px;top:330px;height:48px">${aws}</div>
	<div class="logo" style="left:1748px;top:330px;height:48px">${gcp}</div>
	</div></div></div></body></html>`;
}

function parseOutputDir(argv: string[]): string {
	const args = argv[0] === "--" ? argv.slice(1) : argv;
	const index = args.indexOf("--output-dir");
	const value = index >= 0 ? args[index + 1] : undefined;
	if (!value) throw new Error("Usage: pnpm render-byoc-hero -- --output-dir <path>");
	return path.resolve(value);
}

async function main() {
	const OUT = parseOutputDir(process.argv.slice(2));
	await mkdir(OUT, { recursive: true });
	const html = await buildHtml();
	await writeFile(path.join(OUT, "scene.html"), html);
	const browser = await chromium.launch();
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
