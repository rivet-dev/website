import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

// OpenTelemetry launch hero: the launch title plus a simplified version of the
// rays-and-spans diagram from the post, on an ink plate. The variations differ
// only in where the OpenTelemetry mark sits:
//
//   inset   gold mark inside the plate's top-left corner
//   corner  gold mark inside the plate's bottom-right corner
//   lockup  white tile beside the title, below the plate
//   above   white tile centered above the title, below the plate
//
//   pnpm render-otel-hero -- --output-dir /tmp/otel-hero [--variation inset]
//
// Writes <variation>-image.png (2048x1024), <variation>-social.png (2048x1238)
// and <variation>.html. With no --variation, renders all four.
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(SCRIPT_DIR, "../../../..");
const ASSETS = path.resolve(SCRIPT_DIR, "../assets/logos");
const CARD_W = 2048;
const CARD_H = 1024;
/** OpenTelemetry brand gold. */
const OTEL = "#F5A800";

const INK = "#1B1916";
const INK_SOFT = "#56524A";
const PAPER = "#EFEFEF";
const PINE = "#2E4034";
const SAGE = "#93A286";
const CREAM = "#F5F1E8";
const PINE_TINT = "#E7ECE7";

type Variation = "intro" | "stacked" | "inset" | "corner" | "lockup" | "above";

const VARIATIONS: Variation[] = [
	"intro",
	"stacked",
	"inset",
	"corner",
	"lockup",
	"above",
];

interface Palette {
	/** Diagram frame, span-bar stroke, link arrows. */
	line: string;
	/** Card fill. */
	card: string;
	/** Card stroke. */
	cardLine: string;
	/** Parent span bar fill. */
	bar: string;
	/** Primary label text. */
	text: string;
	/** Secondary label text. */
	muted: string;
}

const LIGHT: Palette = {
	line: PINE,
	card: "#FFFFFF",
	cardLine: INK,
	bar: PINE_TINT,
	text: INK,
	muted: INK_SOFT,
};

const DARK: Palette = {
	line: SAGE,
	card: "rgba(245,241,232,0.06)",
	cardLine: "rgba(245,241,232,0.35)",
	bar: "rgba(147,162,134,0.24)",
	text: CREAM,
	muted: "rgba(245,241,232,0.62)",
};

/**
 * Child span bars per trace, as `[start, width]` within the card's 198px
 * content width. Without labels the only thing that says "trace" is the
 * silhouette, so children start late and siblings sit at different offsets —
 * left-aligned equal-length bars read as a loading skeleton instead.
 */
const TRACES: [number, number][][] = [
	[
		[8, 126],
		[26, 78],
		[142, 48],
	],
	[
		[12, 90],
		[30, 54],
		[110, 80],
	],
	[
		[6, 150],
		[22, 96],
		[132, 58],
	],
];

/** Span labels for the annotated variant, matching the post's own diagram. */
const TRACE_LABELS = [
	{ parent: "chat/sendMessage", child: "rivet.sqlite.execute" },
	{ parent: "chat/postDigest", child: "summarizer/summarize" },
	{ parent: "chat/workflow", child: "chat/charge-card" },
];

const MONO = "JetBrains Mono, ui-monospace, monospace";

/**
 * The annotated diagram: a dashed ray frame around three labelled trace cards
 * joined by link arrows. Reads as a real trace view, at the cost of text that
 * shrinks to nothing in a feed thumbnail. Authored at 880x190.
 */
function labelledDiagram(id: string, p: Palette): string {
	const CARD = 230;
	const GAP = 65;
	const cards = TRACE_LABELS.map((trace, i) => {
		const x = 30 + i * (CARD + GAP);
		const link =
			i === 0
				? ""
				: `<path d="M${x - GAP + 2} 101 H${x - 2}" fill="none" stroke="${p.line}" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#${id}-arrow)"/>
			<text x="${x - GAP / 2}" y="92" text-anchor="middle" font-size="12" font-family="${MONO}" fill="${p.line}">link</text>`;
		return `${link}
			<rect x="${x}" y="64" width="${CARD}" height="102" rx="8" fill="${p.card}" stroke="${p.cardLine}" stroke-width="1.4"/>
			<rect x="${x + 12}" y="90" width="206" height="22" rx="4" fill="${p.bar}" stroke="${p.line}" stroke-width="1.2"/>
			<text x="${x + 22}" y="105" font-size="12.5" font-family="${MONO}" fill="${p.text}">${trace.parent}</text>
			<rect x="${x + 28}" y="122" width="178" height="22" rx="4" fill="none" stroke="${p.muted}" stroke-width="1"/>
			<text x="${x + 38}" y="137" font-size="12.5" font-family="${MONO}" fill="${p.muted}">${trace.child}</text>`;
	}).join("\n");

	return `<svg viewBox="0 0 880 190" xmlns="http://www.w3.org/2000/svg">
		<defs><marker id="${id}-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="${p.line}"/></marker></defs>
		<rect x="16" y="28" width="848" height="154" rx="10" fill="none" stroke="${p.line}" stroke-width="1.4" stroke-dasharray="7 6"/>
		<text x="36" y="51" font-size="11.5" font-family="${MONO}" font-weight="600" letter-spacing="0.14em" fill="${p.line}">RAY ID 4f2c9ab1</text>
		${cards}
	</svg>`;
}

/**
 * The same diagram stripped to its shape: a dashed ray frame around three trace
 * cards of unlabelled span bars, joined by link arrows. No text, so it stays
 * legible at hero scale and as a feed thumbnail. Authored at 880x190.
 */
function condensedDiagram(id: string, p: Palette): string {
	const CARD = 230;
	const GAP = 65;
	const BAR = 14;
	/** Card padding, and the parent bar's left edge. */
	const PAD = 16;
	const cards = TRACES.map((children, i) => {
		const x = 30 + i * (CARD + GAP);
		const link =
			i === 0
				? ""
				: `<path d="M${x - GAP + 2} 79 H${x - 2}" fill="none" stroke="${p.line}" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#${id}-arrow)"/>`;
		// Starts are measured from the parent bar's left edge, so a child that
		// begins later visibly begins later than its parent.
		const bars = children
			.map(
				([start, width], row) =>
					`<rect x="${x + PAD + start}" y="${76 + row * 22}" width="${width}" height="${BAR}" rx="3" fill="none" stroke="${p.muted}" stroke-width="1.2"/>`,
			)
			.join("\n\t\t\t");
		return `${link}
			<rect x="${x}" y="36" width="${CARD}" height="116" rx="8" fill="${p.card}" stroke="${p.cardLine}" stroke-width="1.4"/>
			<rect x="${x + PAD}" y="54" width="198" height="${BAR}" rx="3" fill="${p.bar}" stroke="${p.line}" stroke-width="1.2"/>
			${bars}`;
	}).join("\n");

	return `<svg viewBox="0 0 880 190" xmlns="http://www.w3.org/2000/svg">
		<defs><marker id="${id}-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="${p.line}"/></marker></defs>
		<rect x="16" y="16" width="848" height="156" rx="10" fill="none" stroke="${p.line}" stroke-width="1.4" stroke-dasharray="7 6"/>
		${cards}
	</svg>`;
}

function body(variation: Variation, mark: string, labels: boolean): string {
	const eyebrow = `<p class="eyebrow">Introducing</p>`;
	const title = `<h1>OpenTelemetry for Actors and Workflows</h1>`;
	// Single-colour gold directly on ink; on paper the mark rides in a white
	// tile in its official two-tone brand colours, the same treatment the BYOC
	// and MCP heroes give third-party marks.
	const gold = `<div class="otel-gold">${monoMark(mark, OTEL)}</div>`;
	const tile = `<div class="otel-tile">${brandMark(mark)}</div>`;
	const draw = labels ? labelledDiagram : condensedDiagram;
	const svg = (width: number, p: Palette) =>
		`<div class="diagram" style="width:${width}px">${draw(variation, p)}</div>`;
	const plate = (inner = "") => `<div class="plate">${inner}${svg(1400, DARK)}</div>`;

	switch (variation) {
		// The BYOC/MCP lockup: eyebrow, mark beside a short product title, one
		// supporting graphic below. Just the product name — no sentence.
		case "intro":
			return `<div class="intro">
				${eyebrow}
				<div class="lockup">${tile}<h1>OpenTelemetry</h1></div>
				${svg(1180, LIGHT)}
			</div>`;
		case "stacked":
			return `<div class="stacked">
				${eyebrow}
				<div class="lockup">${tile}<h1>OpenTelemetry for Rivet<br/>Actors and Workflows</h1></div>
				${svg(1560, LIGHT)}
			</div>`;
		case "inset":
			return `<div class="plate-layout">${plate(gold)}${eyebrow}${title}</div>`;
		case "corner":
			return `<div class="plate-layout">${plate(gold)}${eyebrow}${title}</div>`;
		case "lockup":
			return `<div class="plate-layout">${plate()}${eyebrow}
				<div class="lockup">${tile}${title}</div>
			</div>`;
		case "above":
			return `<div class="plate-layout">${plate()}${tile}${title}</div>`;
	}
}

const clean = (svg: string) =>
	svg.replace(/<\?xml[^>]*\?>/i, "").replace(/<title>[^<]*<\/title>/i, "");

/**
 * The official CNCF mark is two-tone: gold plus blue. The blue is what makes it
 * legible on a white tile, so keep both fills there.
 */
const brandMark = (svg: string) => clean(svg);

/** Collapse both brand fills to one color for placements directly on ink. */
const monoMark = (svg: string, fill: string) =>
	clean(svg).replace(/fill="#[0-9a-f]{6}"/gi, `fill="${fill}"`);

async function buildHtml(variation: Variation, labels: boolean): Promise<string> {
	const [sans, mono, mark] = await Promise.all([
		readFile(path.join(REPO, "public/fonts/manrope/Manrope-Variable-latin.woff2")),
		readFile(path.join(REPO, "public/fonts/jetbrains-mono/JetBrainsMono-Variable-latin.woff2")),
		readFile(path.join(ASSETS, "opentelemetry.svg"), "utf8"),
	]);

	return `<!doctype html><html><head><meta charset="utf-8"><style>
	@font-face { font-family: "Manrope"; src: url("data:font/woff2;base64,${sans.toString("base64")}") format("woff2"); font-weight: 200 800; }
	@font-face { font-family: "JetBrains Mono"; src: url("data:font/woff2;base64,${mono.toString("base64")}") format("woff2"); font-weight: 100 800; }
	* { box-sizing: border-box; }
	html, body { margin: 0; background: ${PAPER}; }
	.stage { position: relative; width: ${CARD_W}px; height: ${CARD_H}px; overflow: hidden; background: ${PAPER}; }
	.card { position: absolute; left: 0; top: 0; width: ${CARD_W}px; height: ${CARD_H}px; font-family: "Manrope", sans-serif; color: ${INK}; }
	.eyebrow { margin: 0 0 24px; font-size: 40px; line-height: 1; font-weight: 500; color: ${INK_SOFT}; }
	h1 { margin: 0; font-weight: 500; letter-spacing: -0.015em; line-height: 1.06; }
	.diagram svg { display: block; width: 100%; height: auto; }

	.plate-layout { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 120px; }
	.plate { position: relative; width: 1680px; padding: 84px 120px; border-radius: 18px; background: ${INK}; }
	.plate-layout .eyebrow { margin: 68px 0 20px; }
	.plate-layout h1 { font-size: 92px; text-align: center; }

	/* Gold on ink, inside the plate. Both placements clear the diagram's dashed
	   ray frame: inset sits above it in flow, corner sits in the right gutter. */
	.otel-gold svg { display: block; width: 100%; height: 100%; }
	.v-inset .otel-gold { width: 84px; height: 84px; margin: 0 0 44px 4px; }
	.v-corner .otel-gold { position: absolute; width: 84px; height: 84px; top: 50%; right: 34px; transform: translateY(-50%); }

	/* Gold in a white tile, on paper. */
	.otel-tile { width: 132px; height: 132px; border-radius: 30%; background: #FFFFFF; border: 2px solid rgba(27, 25, 22, 0.1); display: flex; align-items: center; justify-content: center; }
	.otel-tile svg { display: block; width: 78px; height: 78px; }

	.lockup { display: flex; align-items: center; gap: 44px; }
	.v-lockup h1 { font-size: 84px; }
	.v-above .otel-tile { margin: 64px 0 28px; }

	/* BYOC/MCP "Introducing" lockup, at that hero's type scale. */
	.intro { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
	.intro .eyebrow { margin: 0 0 42px; font-size: 44px; }
	.intro .lockup { gap: 56px; margin-bottom: 96px; }
	.intro h1 { font-size: 156px; line-height: 1; }
	.intro .otel-tile { flex: none; width: 186px; height: 186px; }
	.intro .otel-tile svg { width: 112px; height: 112px; }

	/* Light layout: title dominant, diagram as a paper footer. */
	.stacked { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 72px; padding: 0 120px; }
	.stacked .eyebrow { margin: 0; }
	.stacked h1 { font-size: 112px; }
	.stacked .otel-tile { flex: none; width: 152px; height: 152px; }
	.stacked .otel-tile svg { width: 90px; height: 90px; }
	</style></head><body><div class="stage"><div class="card v-${variation}">
	${body(variation, mark, labels)}
	</div></div></body></html>`;
}

function parseArgs(argv: string[]): { outputDir: string; variations: Variation[]; labels: boolean } {
	const args = argv[0] === "--" ? argv.slice(1) : argv;
	const opt = (flag: string) => {
		const index = args.indexOf(flag);
		return index >= 0 ? args[index + 1] : undefined;
	};
	const outputDir = opt("--output-dir");
	if (!outputDir)
		throw new Error(
			`Usage: pnpm render-otel-hero -- --output-dir <path> [--variation ${VARIATIONS.join("|")}] [--labels]`,
		);
	const one = opt("--variation") as Variation | undefined;
	if (one && !VARIATIONS.includes(one)) throw new Error(`Unknown variation: ${one}`);
	return {
		outputDir: path.resolve(outputDir),
		variations: one ? [one] : VARIATIONS,
		labels: args.includes("--labels"),
	};
}

async function main() {
	const { outputDir: OUT, variations, labels } = parseArgs(process.argv.slice(2));
	await mkdir(OUT, { recursive: true });
	const browser = await chromium.launch();
	for (const variation of variations) {
		const html = await buildHtml(variation, labels);
		await writeFile(path.join(OUT, `${variation}.html`), html);
		for (const target of [
			{ name: "image", w: 2048, h: 1024 },
			{ name: "social", w: 2048, h: 1238 },
		]) {
			const page = await browser.newPage({
				viewport: { width: target.w, height: target.h },
				deviceScaleFactor: 1,
			});
			await page.setContent(html, { waitUntil: "load" });
			await page.evaluate(() => document.fonts.ready);
			await page.evaluate((h) => {
				const stage = document.querySelector<HTMLElement>(".stage")!;
				const card = document.querySelector<HTMLElement>(".card")!;
				stage.style.height = `${h}px`;
				card.style.top = `${Math.round((h - 1024) / 2)}px`;
			}, target.h);
			await page.screenshot({ path: path.join(OUT, `${variation}-${target.name}.png`) });
			await page.close();
			console.log(`wrote ${variation}-${target.name}.png`);
		}
	}
	await browser.close();
}

main().catch((e) => {
	console.error(e);
	process.exitCode = 1;
});
