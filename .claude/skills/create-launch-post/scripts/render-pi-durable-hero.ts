import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

// Pi Durable launch hero, in the Pi 1.0 "Introducing" style: the bare Pi mark
// beside the title, over a run timeline. The Pi Actor runs model and tool
// steps, each checkpointed down into the Actor's SQLite. A crash cuts the
// track, and the run resumes from its last checkpoint and finishes.
//
//   pnpm tsx .claude/skills/create-launch-post/scripts/render-pi-durable-hero.ts \
//     --output-dir /tmp/pi-durable-hero [--browser /path/to/chrome]
//
// Writes image.png (2048x1024), social.png (2048x1238) and hero.html.
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(SCRIPT_DIR, "../../../..");
const CARD_W = 2048;
const CARD_H = 1024;

const INK = "#1B1916";
const INK_SOFT = "#56524A";
const PAPER = "#EFEFEF";
const PAPER_MID = "#E3E3E5";
const PINE = "#2E4034";
const CUT = "#E8590C";

/** The Agents product accent, from `src/sitemap/product-metadata.ts`. */
const AGENTS = "#2C5A7A";

/** The Pi mark from public/images/registry/pi.svg, in an 800x800 box. */
const PI_PATHS = (fill: string) =>
	`<path fill="${fill}" fill-rule="evenodd" d="M165.29 165.29H517.36V400H400V517.36H282.65V634.72H165.29ZM282.65 282.65V400H400V282.65Z"/><path fill="${fill}" d="M517.36 400H634.72V634.72H517.36Z"/>`;

/** The Pi product tile, in the 128-unit geometry of ProductBadge. */
const PI_MARK_SCALE = 80 / 470; // the colored Pi mark (pi.dev), 66 units wide in the 128-unit tile
const PI_TILE = `<rect x="1" y="1" width="126" height="126" rx="44" fill="#FFFFFF" stroke="#1B1916" stroke-opacity="0.08" stroke-width="2"/>
	<g transform="translate(${64 - 400 * PI_MARK_SCALE} ${64 - 400 * PI_MARK_SCALE}) scale(${PI_MARK_SCALE})">
		<path fill="#F09082" d="M165.29 165.29H517.36V400H400V282.65H165.29Z"/>
		<path fill="#4D9ABF" d="M165.29 282.65H282.65V400H400V517.36H282.65V634.72H165.29Z"/>
		<path fill="#F1BE58" d="M517.36 400H634.72V634.72H517.36Z"/>
	</g>`;

/** The SQLite mark (assets/logos/sqlite.svg) in one color on the blue box. */
const SQLITE_MONO = `<path d="M4.96.29H.847c-.276 0-.5.226-.5.5v4.536c0 .276.226.5.5.5h2.71c-.03-1.348.43-3.964 1.404-5.54z" fill="#FFFFFF"/>
	<path d="M4.81.437H.847c-.196 0-.355.16-.355.355v4.205c.898-.345 2.245-.642 3.177-.628A28.93 28.93 0 0 1 4.811.437z" fill="${AGENTS}"/>
	<path d="M5.92.142c-.282-.25-.623-.15-.96.148l-.15.146c-.576.61-1.1 1.742-1.276 2.607a2.38 2.38 0 0 1 .148.426l.022.1.022.102s-.005-.02-.026-.08l-.014-.04a.461.461 0 0 0-.009-.022c-.038-.087-.14-.272-.187-.352a8.789 8.789 0 0 0-.103.321c.132.242.212.656.212.656s-.007-.027-.04-.12c-.03-.083-.176-.34-.21-.4-.06.22-.083.368-.062.404.04.07.08.2.115.324a7.52 7.52 0 0 1 .132.666l.005.062a6.11 6.11 0 0 0 .015.75c.026.313.075.582.137.726l.042-.023c-.09-.284-.128-.655-.112-1.084.025-.655.175-1.445.454-2.268C4.548 1.938 5.2.94 5.798.464c-.545.492-1.282 2.084-1.502 2.673-.247.66-.422 1.28-.528 1.873.182-.556.77-.796.77-.796s.29-.356.626-.865l-.645.172-.208.092s.53-.323.987-.47c.627-.987 1.31-2.39.622-3.002" fill="#FFFFFF"/>`;

/** Strips the outer <svg> so a mark can be nested at any position. */
function inner(svg: string): string {
	return svg
		.replace(/<\?xml[^>]*\?>/i, "")
		.replace(/^[\s\S]*?<svg[^>]*>/i, "")
		.replace(/<\/svg>\s*$/i, "");
}

type Step = "model" | "tool";

/** A white glyph for each step: a bot head for a model request, a prompt for a tool call. */
function glyph(kind: Step, cx: number, cy: number): string {
	if (kind === "model") {
		// Head 32x22 with an antenna, two eyes cut out in the node color, and side ears.
		const top = cy - 7;
		return `<path d="M${cx} ${top} V${top - 7}" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round"/>
		<circle cx="${cx}" cy="${top - 9}" r="3.5" fill="#FFFFFF"/>
		<rect x="${cx - 16}" y="${top}" width="32" height="22" rx="7" fill="#FFFFFF"/>
		<rect x="${cx - 21}" y="${top + 7}" width="4" height="8" rx="2" fill="#FFFFFF"/>
		<rect x="${cx + 17}" y="${top + 7}" width="4" height="8" rx="2" fill="#FFFFFF"/>
		<circle cx="${cx - 6.5}" cy="${top + 11}" r="3.5" fill="${AGENTS}"/>
		<circle cx="${cx + 6.5}" cy="${top + 11}" r="3.5" fill="${AGENTS}"/>`;
	}
	return `<path d="M${cx - 13} ${cy - 10} L${cx - 3} ${cy} L${cx - 13} ${cy + 10}" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
		<path d="M${cx + 1} ${cy + 11} H${cx + 14}" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/>`;
}

function stepNode(kind: Step, cx: number, cy: number, s: number): string {
	const fill = kind === "model" ? AGENTS : INK;
	return `<rect x="${cx - s / 2}" y="${cy - s / 2}" width="${s}" height="${s}" rx="${s * 0.34375}" fill="${fill}" filter="url(#lift)"/>${glyph(kind, cx, cy).replaceAll(`fill="${AGENTS}"`, `fill="${fill}"`)}`;
}

function doneNode(cx: number, cy: number, s: number): string {
	return `<rect x="${cx - s / 2}" y="${cy - s / 2}" width="${s}" height="${s}" rx="${s * 0.34375}" fill="${PINE}" filter="url(#lift)"/>
		<path d="M${cx - 14} ${cy + 1} L${cx - 4} ${cy + 11} L${cx + 15} ${cy - 10}" fill="none" stroke="#FFFFFF" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/**
 * The run timeline. Steps sit on one track at a fixed pitch; every step drops a
 * checkpoint tick into the SQLite rail below. A crash cuts the track between
 * the third and fourth steps, and a dashed arc carries the run from the last
 * checkpoint over the cut.
 */
function diagram(sqlite: string): string {
	const PI = 108; // Pi tile, and the SQLite tile below it
	const S = 64; // step tile
	const TRACK = 118; // track y
	const X0 = PI + 110; // first step
	const PITCH = 150;
	const CUT_W = 150; // the extra room the break takes
	const steps: Step[] = ["model", "tool", "model", "tool", "model"];
	const xs = steps.map((_, i) => X0 + i * PITCH + (i >= 3 ? CUT_W : 0));
	const doneX = xs[xs.length - 1] + PITCH;
	const cutX = (xs[2] + xs[3]) / 2;
	const GRAY = "#B8B5AE";
	const QUIET = "#A6A39C";

	// SQLite: a standard white tile under the Pi tile, and a slim rail with one saved row per step
	const DB = PI;
	const DB_Y = 222;
	const RAIL_Y = DB_Y + DB / 2 - 24;
	const RAIL_H = 48;
	const railX = PI + 32;
	const railEnd = doneX + 46;
	const w = railEnd + 6;
	const h = DB_Y + DB + 8;

	// The line, torn into ragged ends at the break
	const tornL = `M${PI + 14} ${TRACK} H${cutX - 52} l8 -10 l6 16 l7 -13 l5 9`;
	const tornR = `M${cutX + 26} ${TRACK + 5} l6 -13 l6 15 l7 -11 l9 4 H${doneX - S / 2 - 10}`;
	const track = [tornL, tornR]
		.map((d) => `<path d="${d}" fill="none" stroke="${GRAY}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`)
		.join("");
	// Fragments from the tear, and a small bolt above the gap
	const debris = `<g fill="${GRAY}">
			<rect x="${cutX - 34}" y="${TRACK + 14}" width="9" height="9" rx="1.5" transform="rotate(28 ${cutX - 30} ${TRACK + 18})"/>
			<rect x="${cutX - 22}" y="${TRACK + 32}" width="6" height="6" rx="1" transform="rotate(-18 ${cutX - 19} ${TRACK + 35})"/>
			<rect x="${cutX + 14}" y="${TRACK + 18}" width="8" height="8" rx="1.5" transform="rotate(-24 ${cutX + 18} ${TRACK + 22})"/>
		</g>
		<path transform="translate(${cutX - 2} ${TRACK - 44})" d="M4 -13 L-7 2 H0 L-3 13 L8 -2 H1 L6 -13 Z" fill="${CUT}" stroke="${CUT}" stroke-width="1.5" stroke-linejoin="round"/>`;

	// Resume: from the last saved step, over the break, to the next one
	const ax1 = xs[2] + 10;
	const ax2 = xs[3] - 10;
	const resume = `<path d="M${ax1} ${TRACK - S / 2 - 10} C${ax1 + 30} ${TRACK - 128}, ${ax2 - 30} ${TRACK - 128}, ${ax2} ${TRACK - S / 2 - 12}" fill="none" stroke="${GRAY}" stroke-width="3" stroke-dasharray="9 8" stroke-linecap="round" marker-end="url(#arrow)"/>`;

	// Step tiles: white, gray outline, gray glyph. The finished step is filled in.
	const quiet = (svg: string, ink: string) => svg.replaceAll('"#FFFFFF"', `"${ink}"`).replaceAll(`fill="${AGENTS}"`, 'fill="#FFFFFF"');
	const iconNode = (kind: Step, x: number) =>
		`<rect x="${x - S / 2}" y="${TRACK - S / 2}" width="${S}" height="${S}" rx="${S * 0.34375}" fill="#FFFFFF" stroke="#E0DDD6" stroke-width="2.5" filter="url(#lift)"/>${quiet(glyph(kind, x, TRACK), QUIET)}`;
	const finish = `<rect x="${doneX - S / 2}" y="${TRACK - S / 2}" width="${S}" height="${S}" rx="${S * 0.34375}" fill="${QUIET}" filter="url(#lift)"/>
		<path d="M${doneX - 13} ${TRACK + 1} L${doneX - 4} ${TRACK + 10} L${doneX + 14} ${TRACK - 9}" fill="none" stroke="#FFFFFF" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>`;
	const nodes = steps.map((kind, i) => iconNode(kind, xs[i])).join("") + finish;

	// Each finished step drops into its own saved row on the rail
	const saved = [...xs, doneX];
	const ticks = saved
		.map((x) => `<path d="M${x} ${TRACK + S / 2 + 8} V${RAIL_Y + 10}" stroke="${GRAY}" stroke-width="2.5" stroke-dasharray="2 7" stroke-linecap="round"/>`)
		.join("");
	const rows = saved
		.map((x, i) => `<rect x="${x - 26}" y="${RAIL_Y + 14}" width="52" height="20" rx="6" fill="${i === saved.length - 1 ? QUIET : "#E6E3DC"}"/>`)
		.join("");
	const rail = `<rect x="${railX}" y="${RAIL_Y}" width="${railEnd - railX}" height="${RAIL_H}" rx="16" fill="#FFFFFF" stroke="${INK}" stroke-opacity="0.07" stroke-width="2" filter="url(#lift)"/>${rows}`;
	const db = `<g filter="url(#lift)"><rect x="${(PI - DB) / 2 + 1}" y="${DB_Y + 1}" width="${DB - 2}" height="${DB - 2}" rx="${DB * 0.34375}" fill="#FFFFFF" stroke="${INK}" stroke-opacity="0.08" stroke-width="2"/></g>
		<svg x="${(PI - DB) / 2 + 20}" y="${DB_Y + 20}" width="${DB - 40}" height="${DB - 40}" viewBox="0 0 128 128">${sqlite}</svg>
		<path d="M${(PI + DB) / 2 + 6} ${RAIL_Y + RAIL_H / 2} H${railX - 4}" stroke="${GRAY}" stroke-width="2.5" stroke-dasharray="2 7" stroke-linecap="round"/>`;

	return `<svg viewBox="-4 -4 ${w + 8} ${h + 8}" xmlns="http://www.w3.org/2000/svg" font-family="Manrope, sans-serif">
		<defs>
			<marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="${GRAY}"/></marker>
			<filter id="lift" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#1B1916" flood-opacity="0.07"/></filter>
		</defs>
		${rail}
		${db}
		${ticks}
		${track}
		${debris}
		${resume}
		<g filter="url(#lift)"><svg x="0" y="${TRACK - PI / 2}" width="${PI}" height="${PI}" viewBox="0 0 128 128">${PI_TILE}</svg></g>
		${nodes}
	</svg>`;
}

const piLockupMark = (size: number) =>
	`<div class="pi-mark" style="width:${size}px;height:${size}px"><svg viewBox="165.29 165.29 469.43 469.43">${PI_PATHS(INK)}</svg></div>`;

let DURABLE_STYLE = "tile";
/** Inline SVG artwork for "Durable", drawn at 150px with its baseline at y=128 in a 160px-tall box. */
let DURABLE_SVG = "";

async function buildHtml(): Promise<string> {
	const [sans, mono, sqlite] = await Promise.all([
		readFile(path.join(REPO, "public/fonts/manrope/Manrope-Variable-latin.woff2")),
		readFile(path.join(REPO, "public/fonts/jetbrains-mono/JetBrainsMono-Variable-latin.woff2")).catch(() => null),
		readFile(path.join(REPO, "public/images/registry/sqlite3.svg"), "utf8"),
	]);
	const monoFace = mono
		? `@font-face { font-family: "JetBrains Mono"; src: url("data:font/woff2;base64,${mono.toString("base64")}") format("woff2"); font-weight: 100 800; }`
		: "";

	return `<!doctype html><html><head><meta charset="utf-8"><style>
	@font-face { font-family: "Manrope"; src: url("data:font/woff2;base64,${sans.toString("base64")}") format("woff2"); font-weight: 200 800; }
	${monoFace}
	* { box-sizing: border-box; }
	html, body { margin: 0; background: ${PAPER}; }
	.stage { position: relative; width: ${CARD_W}px; height: ${CARD_H}px; overflow: hidden; background: ${PAPER}; }
	.card { position: absolute; left: 0; top: 0; width: ${CARD_W}px; height: ${CARD_H}px; font-family: "Manrope", sans-serif; color: ${INK}; }
	.intro { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
	.eyebrow { margin: 0 0 32px; font-size: 44px; line-height: 1; font-weight: 500; color: ${INK_SOFT}; display: flex; align-items: center; gap: 18px; }
	.beta { font-size: 26px; font-weight: 600; letter-spacing: 0.04em; color: ${AGENTS}; border: 2.5px solid ${AGENTS}; border-radius: 999px; padding: 6px 16px 7px; }
	h1 { margin: 0; font-weight: 500; letter-spacing: -0.02em; line-height: 1; font-size: 164px; white-space: nowrap; }
	.lockup { display: flex; align-items: center; gap: 44px; margin-bottom: 96px; }
	/* "Durable" in the blue Pi tile's colors: the Agents accent with a white inset ring */
	.durable-text { color: ${AGENTS}; }
	/* Scale the 150px artwork to the 164px title and sit its baseline on the text baseline */
	.durable-svg svg { display: inline-block; height: 174.9px; width: auto; vertical-align: -35px; margin: 0 4px; overflow: visible; }
	.durable-tile { display: inline-block; color: #FFFFFF; background: ${AGENTS}; border-radius: 44px; padding: 6px 40px 22px; margin: 0 6px; box-shadow: inset 0 0 0 9px ${AGENTS}, inset 0 0 0 16px #FFFFFF, 0 10px 24px rgba(27,25,22,0.16); }
	.pi-mark { flex: none; }
	.pi-mark svg { display: block; width: 100%; height: 100%; }
	.diagram { width: 1240px; }
	.diagram svg { display: block; width: 100%; height: auto; }
	</style></head><body><div class="stage"><div class="card">
	<div class="intro">
		<p class="eyebrow">Introducing</p>
		<div class="lockup"><h1>Pi ${DURABLE_SVG ? `<span class="durable-svg">${DURABLE_SVG}</span>` : `<span class="durable durable-${DURABLE_STYLE}">Durable</span>`} for Rivet</h1></div>
		<div class="diagram">${diagram(inner(sqlite))}</div>
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
	if (!outputDir) throw new Error("Usage: render-pi-durable-hero.ts --output-dir <path> [--browser <path>]");
	return { outputDir: path.resolve(outputDir), browser: opt("--browser"), durableStyle: opt("--durable-style") ?? "tile", durableSvg: opt("--durable-svg") };
}

async function main() {
	const { outputDir: OUT, browser: executablePath, durableStyle, durableSvg } = parseArgs(process.argv.slice(2));
	DURABLE_STYLE = durableStyle;
	if (durableSvg) DURABLE_SVG = await readFile(durableSvg, "utf8");
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
