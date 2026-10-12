import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

// agentOS Hosted VMs launch hero, in the Pi 1.0 "Introducing" style: the agentOS
// badge beside the title, over a fleet of VMs. A TypeScript call and an HTTP call
// both land on one VM in the fleet.
//
//   pnpm tsx .claude/skills/create-launch-post/scripts/render-agentos-hosted-vms-hero.ts \
//     --output-dir /tmp/agentos-hero [--browser /path/to/chrome]
//
// Writes image.png (2048x1024), social.png (2048x1238) and hero.html.
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(SCRIPT_DIR, "../../../..");
const CARD_W = 2048;
const CARD_H = 1024;

const INK = "#1B1916";
const INK_SOFT = "#56524A";
const PAPER = "#EFEFEF";
const PINE = "#2E4034";
const GRAY = "#B8B5AE";

/** The agentOS product accent, from `src/sitemap/product-metadata.ts`. */
const AGENTOS = "#9C3A3F";
const AGENTOS_SOFT = "#C99A9D";

/** Strips the outer <svg> so a mark can be nested at any position. */
function inner(svg: string): string {
	return svg
		.replace(/<\?xml[^>]*\?>/i, "")
		.replace(/^[\s\S]*?<svg[^>]*>/i, "")
		.replace(/<\/svg>\s*$/i, "");
}

/** A product tile at the ProductBadge geometry: 34.375% radius, mark painted in `mark`. */
function tile(logo: string, x: number, y: number, s: number, fill: string, mark = "#FFFFFF", extra = ""): string {
	const art = logo.replaceAll('"white"', `"${mark}"`).replaceAll("fill:white", `fill:${mark}`);
	return `<g ${extra}><rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s * 0.34375}" fill="${fill}"/>
		<svg x="${x}" y="${y}" width="${s}" height="${s}" viewBox="0 0 128 128" fill="none">${art}</svg></g>`;
}

/** A white call card: one line of code behind a leading mark (`lead` is drawn in card coordinates). */
const CALL_H = 100;
function callCard(y: number, w: number, lead: string, codeX: number, code: string): string {
	return `<g filter="url(#lift)"><rect x="0" y="${y}" width="${w}" height="${CALL_H}" rx="26" fill="#FFFFFF" stroke="${INK}" stroke-opacity="0.07" stroke-width="2"/></g>
		<g transform="translate(0 ${y})">${lead}</g>
		<text x="${codeX}" y="${y + CALL_H / 2 + 10}" font-family="'JetBrains Mono', monospace" font-size="27" fill="${INK}">${code}</text>`;
}

function diagram(logo: string): string {
	const CW = 790; // call card width
	const S = 96; // fleet tile
	const GAP = 30;
	const COLS = 4;
	const ROWS = 3;
	const GX = CW + 230; // fleet left
	const GY = 0;
	const PAD = 34; // dashed outline padding
	const fleetW = COLS * S + (COLS - 1) * GAP;
	const fleetH = ROWS * S + (ROWS - 1) * GAP;
	const w = GX + fleetW + PAD + 4;
	const h = fleetH + 2 * PAD + 8;

	// The addressed VM: left column, middle row, so both calls land on it without crossing the fleet
	const tx = GX;
	const ty = GY + PAD + (S + GAP);
	const tcy = ty + S / 2;
	const sleeping = new Set(["0,2", "2,1", "1,3"]);
	const fleet: string[] = [];
	for (let r = 0; r < ROWS; r++) {
		for (let c = 0; c < COLS; c++) {
			if (r === 1 && c === 0) continue;
			const x = GX + c * (S + GAP);
			const y = GY + PAD + r * (S + GAP);
			fleet.push(sleeping.has(`${r},${c}`) ? tile(logo, x, y, S, "#DCD9D3", "#F4F2EE") : tile(logo, x, y, S, AGENTOS_SOFT, "#FFFFFF"));
		}
	}
	const target = tile(logo, tx - 10, ty - 10, S + 20, AGENTOS, "#FFFFFF", 'filter="url(#liftStrong)"');
	const outline = `<rect x="${GX - PAD}" y="${GY}" width="${fleetW + 2 * PAD}" height="${fleetH + 2 * PAD}" rx="34" fill="none" stroke="${PINE}" stroke-width="3" stroke-dasharray="14 11"/>`;

	// Call cards, vertically centered on the fleet
	const cardH = CALL_H;
	const y1 = h / 2 - cardH - 26;
	const y2 = h / 2 + 26;
	const fn = (s: string) => `<tspan fill="${AGENTOS}" font-weight="600">${s}</tspan>`;
	const KEYWORD = "#7A4FB5"; // violet keyword, clear of the agentOS red on `run`
	const METHOD = "#2F6B4F"; // HTTP green, a brighter pine
	// Both cards lead with a 44px square mark so the code starts at the same x
	const tsLogo = `<rect x="28" y="28" width="44" height="44" rx="8" fill="#3178C6"/><text x="68" y="67" text-anchor="end" font-size="21" font-weight="800" fill="#FFFFFF" letter-spacing="-0.02em">TS</text>`;
	// A white globe on the method green: outline, meridian, and equator
	const httpLogo = `<rect x="28" y="28" width="44" height="44" rx="8" fill="${METHOD}"/>
		<g fill="none" stroke="#FFFFFF" stroke-width="2.6"><circle cx="50" cy="50" r="12"/><ellipse cx="50" cy="50" rx="5.5" ry="12"/><path d="M38 50 H62"/></g>`;
	const CODE_X = 92;
	const ts = callCard(y1, CW, tsLogo, CODE_X, `<tspan fill="${KEYWORD}" font-weight="600">await</tspan> vm.v1.process.${fn("run")}({ … })`);
	const http = callCard(y2, CW, httpLogo, CODE_X, `<tspan fill="${METHOD}" font-weight="700">POST</tspan> /gateway/my-vm/action/v1.process.${fn("run")}`);

	// Arrows: from each card's right edge into the addressed VM's left edge
	const ax = CW + 8;
	const bx = tx - 22;
	const a1 = `M${ax} ${y1 + cardH / 2} C${ax + 120} ${y1 + cardH / 2}, ${bx - 120} ${tcy - 16}, ${bx} ${tcy - 16}`;
	const a2 = `M${ax} ${y2 + cardH / 2} C${ax + 120} ${y2 + cardH / 2}, ${bx - 120} ${tcy + 16}, ${bx} ${tcy + 16}`;
	const arrows = [a1, a2]
		.map((d) => `<path d="${d}" fill="none" stroke="${PINE}" stroke-width="3" stroke-linecap="round" marker-end="url(#arrow)"/>`)
		.join("");

	return `<svg viewBox="-4 -4 ${w + 8} ${h + 8}" xmlns="http://www.w3.org/2000/svg" font-family="Manrope, sans-serif">
		<defs>
			<marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="${PINE}"/></marker>
			<filter id="lift" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#1B1916" flood-opacity="0.07"/></filter>
			<filter id="liftStrong" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#9C3A3F" flood-opacity="0.28"/></filter>
		</defs>
		${outline}
		${fleet.join("")}
		${arrows}
		${target}
		${ts}
		${http}
	</svg>`;
}

async function buildHtml(): Promise<string> {
	const [sans, mono, logoSvg] = await Promise.all([
		readFile(path.join(REPO, "public/fonts/manrope/Manrope-Variable-latin.woff2")),
		readFile(path.join(REPO, "public/fonts/jetbrains-mono/JetBrainsMono-Variable-latin.woff2")),
		readFile(path.join(REPO, "src/images/products/agentos-logo.svg"), "utf8"),
	]);
	const logo = inner(logoSvg);
	const badge = (s: number) =>
		`<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">${tile(logo, 0, 0, s, AGENTOS)}</svg>`;

	return `<!doctype html><html><head><meta charset="utf-8"><style>
	@font-face { font-family: "Manrope"; src: url("data:font/woff2;base64,${sans.toString("base64")}") format("woff2"); font-weight: 200 800; }
	@font-face { font-family: "JetBrains Mono"; src: url("data:font/woff2;base64,${mono.toString("base64")}") format("woff2"); font-weight: 100 800; }
	* { box-sizing: border-box; }
	html, body { margin: 0; background: ${PAPER}; }
	.stage { position: relative; width: ${CARD_W}px; height: ${CARD_H}px; overflow: hidden; background: ${PAPER}; }
	.card { position: absolute; left: 0; top: 0; width: ${CARD_W}px; height: ${CARD_H}px; font-family: "Manrope", sans-serif; color: ${INK}; }
	.intro { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
	.eyebrow { margin: 0 0 32px; font-size: 44px; line-height: 1; font-weight: 500; color: ${INK_SOFT}; }
	h1 { margin: 0; font-weight: 500; letter-spacing: -0.02em; line-height: 1; font-size: 128px; white-space: nowrap; }
	.lockup { display: flex; align-items: center; gap: 40px; margin-bottom: 84px; }
	.lockup svg { display: block; flex: none; }
	.diagram { width: 1500px; }
	.diagram svg { display: block; width: 100%; height: auto; }
	</style></head><body><div class="stage"><div class="card">
	<div class="intro">
		<p class="eyebrow">Introducing</p>
		<div class="lockup">${badge(128)}<h1>agentOS 0.4 &amp; Hosted VMs</h1></div>
		<div class="diagram">${diagram(logo)}</div>
	</div>
	</div></div></body></html>`;
}

function parseArgs(argv: string[]) {
	const args = argv[0] === "--" ? argv.slice(1) : argv;
	const opt = (flag: string) => {
		const index = args.indexOf(flag);
		return index >= 0 ? args[index + 1] : undefined;
	};
	const outputDir = opt("--output-dir");
	if (!outputDir) throw new Error("Usage: render-agentos-hosted-vms-hero.ts --output-dir <path> [--browser <path>]");
	return { outputDir: path.resolve(outputDir), browser: opt("--browser") };
}

async function main() {
	const { outputDir: OUT, browser: executablePath } = parseArgs(process.argv.slice(2));
	await mkdir(OUT, { recursive: true });
	const html = await buildHtml();
	await writeFile(path.join(OUT, "hero.html"), html);
	const browser = await chromium.launch({ executablePath });
	for (const target of [
		{ name: "image", w: 2048, h: 1024 },
		{ name: "social", w: 2048, h: 1238 },
	]) {
		const page = await browser.newPage({ viewport: { width: target.w, height: target.h }, deviceScaleFactor: 1 });
		await page.setContent(html, { waitUntil: "load" });
		await page.evaluate(() => document.fonts.ready);
		await page.evaluate((h) => {
			const stage = document.querySelector<HTMLElement>(".stage")!;
			const card = document.querySelector<HTMLElement>(".card")!;
			stage.style.height = `${h}px`;
			card.style.top = `${Math.round((h - 1024) / 2)}px`;
		}, target.h);
		await page.screenshot({ path: path.join(OUT, `${target.name}.png`) });
		await page.close();
		console.log(`wrote ${target.name}.png`);
	}
	await browser.close();
}

main().catch((e) => {
	console.error(e);
	process.exitCode = 1;
});
