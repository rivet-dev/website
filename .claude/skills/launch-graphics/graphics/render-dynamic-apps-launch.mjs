// Dynamic Apps — launch/social hero (2048×1024, site paper background).
//
//   • "Dynamic Apps" lockup: ink product tile (white mark) + wordmark in Manrope
//   • the landing-page hero explainer, wordless: generated-file stack → deploy
//     code chip → GET 200 + mini browser, joined by arrows
//
// Fonts come from public/, the product mark from src/images/products/,
// playwright from the repo's node_modules; drives system Chromium.
//
//   node .claude/skills/launch-graphics/graphics/render-dynamic-apps-launch.mjs [outDir]
import { createRequire } from "node:module";
import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(SCRIPT_DIR, "../../../..");
const CHROMIUM = "/usr/bin/chromium";
const OUT_DIR = process.argv[2] || path.join(os.homedir(), "tmp/dynamic-apps-graphics");
// VARIANT=chips → generateText() → deployApp() → GET /apps/pied-piper 200, no pictures.
// Variants: pictures (default) | pictures-split | chips | chips-icons | chips-ink | chips-bar | chips-split | plain
// plain → just "Introducing / Dynamic Apps" centered, no explainer (blog hero, 2026-08-31).
// Default (locked in 2026-08-31): pictures-split → launch.png. Other variants write launch-<variant>.png.
const VARIANT = process.env.VARIANT || "pictures-split";
const OUT_NAME = VARIANT === "pictures-split" ? "launch" : `launch-${VARIANT}`;
const IS_CHIPS = VARIANT.startsWith("chips");
const IS_SPLIT = VARIANT.endsWith("-split");
const IS_PLAIN = VARIANT === "plain";

async function loadChromium() {
	const pnpm = path.join(REPO, "node_modules/.pnpm");
	const dir = (await readdir(pnpm)).find((d) => /^playwright@/.test(d));
	if (!dir) throw new Error("playwright not found under node_modules/.pnpm — run `pnpm install`");
	return require(path.join(pnpm, dir, "node_modules/playwright")).chromium;
}

const WIDTH = 2048;
const HEIGHT = 1024;
const dataUrl = (mime, bytes) => `data:${mime};base64,${bytes.toString("base64")}`;

const [sansFont, monoFont, markSvg, nodeSvg] = await Promise.all([
	readFile(path.join(REPO, "public/fonts/manrope/Manrope-Variable-latin.woff2")),
	readFile(path.join(REPO, "public/fonts/jetbrains-mono/JetBrainsMono-Variable-latin.woff2")),
	readFile(path.join(REPO, "src/images/products/dynamic-apps-logo.svg"), "utf8"),
	readFile(path.join(REPO, "public/images/registry/nodejs.svg"), "utf8"),
]);

// Site palette
const INK = "#1B1916";
const INK_SOFT = "#56524A";
const INK_FAINT = "#8A8478";
const PAPER = "#EFEFEF";
const PINE = "#2E4034";
const PRODUCT = "#2F6B4B"; // Dynamic Apps accent (src/sitemap/product-metadata.ts)
// Code palette (src/lib/highlight-code.ts)
const KW = "#8250df";
const STR = "#b45309";
const FN = "#0550ae";

// Everything in the explainer is drawn at K× the landing-page pixel size.
const K = VARIANT === "pictures-split" ? 2.15 : 2.3;
const px = (n) => `${Math.round(n * K)}px`;

const skel = (w, strong) => `<i class="ln" style="width:${w};background:rgba(27,25,22,${strong ? 0.18 : 0.11})"></i>`;

const fileCard = ({ cls, icon, name, lines, caret }) => `
	<div class="fc ${cls}">
		<div class="fh">${icon}${name ? `<span class="fn">${name}</span>` : ""}</div>
		<div class="fl">${lines.map((w, i) => `<div class="lr">${skel(w, i === 0)}${caret && i === lines.length - 1 ? '<i class="caret"></i>' : ""}</div>`).join("")}</div>
	</div>`;

const reactMark = `<svg viewBox="-11.5 -10.5 23 21" class="ic"><circle r="2" fill="#149eca"/><g stroke="#149eca" stroke-width="1" fill="none"><ellipse rx="10" ry="4.5"/><ellipse rx="10" ry="4.5" transform="rotate(60)"/><ellipse rx="10" ry="4.5" transform="rotate(120)"/></g></svg>`;
const icons = {
	react: `<span class="ib" style="background:#eaf8fc">${reactMark}</span>`,
	ts: `<span class="ib ts">TS</span>`,
	node: `<span class="ib" style="background:#eef7ed">${nodeSvg.replace(/<svg /, '<svg class="ic" ')}</span>`,
};

const ICO = {
	sparkle: `<svg class="ci" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/></svg>`,
	upload: `<svg class="ci" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V5"/><path d="M7 10l5-5 5 5"/><path d="M4 19h16"/></svg>`,
	globe: `<svg class="ci" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z"/></svg>`,
};
const downArrow = `<svg class="down" viewBox="0 0 12 22" fill="none" stroke="rgba(27,25,22,0.5)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 1v18"/><path d="M2 15l4 4 4-4"/></svg>`;
const arrow = `<svg class="arrow" viewBox="0 0 40 12" fill="none" stroke="rgba(27,25,22,0.5)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 6h36"/><path d="M33 2l4 4-4 4"/></svg>`;


// Backdrop: the product page's Game of Life motif at generation 0 (ProductMotif
// DynamicAppsMotif). Cells alive at gen 0: "on", "a", and q-cells at phase 0.
// Tiled every 13 columns like the hero, faded out toward the bottom and cut
// away from the center so the lockup and explainer sit on clean paper.
const LIFE = { pitch: 32, cell: 24, inset: 4 };
const boardCells = [
	[3,2,"soft"],[0,3,"soft"],[1,2,"soft"],[2,2,"soft"],[1,3,"soft"],[2,3,"soft"],          // toad (gen 0)
	[6,0,"soft"],[7,0,"soft"],[6,1,"soft"],[9,2,"soft"],[8,3,"soft"],[9,3,"soft"],[7,1,"bright"],[8,2,"bright"], // beacon
	[0,7,"still"],[1,7,"still"],[0,8,"still"],[1,8,"still"],                                  // block
	[6,7,"bright"],[7,8,"bright"],[5,9,"bright"],[6,9,"bright"],[7,9,"bright"],               // glider at origin (5,7), gen 0
];
const TONE = { bright: "rgba(27,25,22,0.075)", soft: "rgba(27,25,22,0.05)" };
const cellRect = (c, r, tone, shift) => {
	const x = (c + shift) * LIFE.pitch + LIFE.inset, y = r * LIFE.pitch + LIFE.inset;
	return tone === "still"
		? `<rect x="${x}" y="${y}" width="${LIFE.cell}" height="${LIFE.cell}" rx="4" fill="none" stroke="rgba(27,25,22,0.07)" stroke-width="1"/>`
		: `<rect x="${x}" y="${y}" width="${LIFE.cell}" height="${LIFE.cell}" rx="4" fill="${TONE[tone]}"/>`;
};
const backdropSvg = `<svg class="backdrop" viewBox="0 0 1280 640" preserveAspectRatio="xMidYMin slice">
	<defs>
		<radialGradient id="cut" cx="50%" cy="50%" r="62%"><stop offset="0.62" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient>
		<linearGradient id="vfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0.45" stop-color="#fff"/><stop offset="0.9" stop-color="#000"/></linearGradient>
		<mask id="mcut"><rect width="1280" height="640" fill="url(#cut)"/></mask>
		<mask id="mv"><rect width="1280" height="640" fill="url(#vfade)"/></mask>
	</defs>
	<g mask="url(#mcut)"><g mask="url(#mv)">
		${[-4, 9, 22, 35].map((shift) => boardCells.map(([c, r, t]) => cellRect(c, r, t, shift)).join("")).join("")}
	</g></g>
</svg>`;

const chip = (inner, icon) => `<div class="piece chip">${icon ? ICO[icon] : ""}${inner}</div>`;
const GEN = `<span><span class="f">generateText</span>()</span>`;
const DEP = `<span><span class="f">deployApp</span>()</span>`;
const GET = `<span><span class="m">GET</span> /apps/pied-piper</span><span class="pill">200</span>`;
const STACK = `<div class="stack">
	${fileCard({ cls: "back", icon: icons.node, lines: ["80%", "60%"] })}
	${fileCard({ cls: "mid", icon: icons.ts, lines: ["75%", "50%"] })}
	${fileCard({ cls: "front", icon: icons.react, name: "App.tsx", lines: ["83%", "66%", "75%"], caret: true })}
</div>`;
const CODE = `<div class="piece code"><span class="kw">await</span> <span class="f">deployApp</span>({
  appId: <span class="str">"pied-piper"</span>,
  files,
});</div>`;
const ROUTE = `<div class="route">
	<div class="piece get"><span><span class="m">GET</span> <span class="p">/apps/pied-piper</span></span><span class="pill">200</span></div>
	<div class="piece browser">
		<div class="bar"><span class="dots"><i></i><i></i><i></i></span><span class="url">acme.dev/apps/pied-piper</span></div>
		<div class="page">
			<div class="hd"><span class="t"></span><span class="b"></span></div>
			<div class="cards">
				<div class="pc">${skel("50%", true)}${skel("100%")}${skel("75%")}</div>
				<div class="pc">${skel("50%", true)}${skel("100%")}${skel("75%")}</div>
			</div>
			${skel("83%")}
		</div>
	</div>
</div>`;
function chipsMarkup() {
	switch (VARIANT) {
		case "chips-icons":
			return `<div class="row">${chip(GEN, "sparkle")}${arrow}${chip(DEP, "upload")}${arrow}${chip(GET, "globe")}</div>`;
		case "chips-ink":
			return `<div class="row ink">${chip(GEN)}${arrow}${chip(DEP)}${arrow}${chip(GET)}</div>`;
		case "chips-bar":
			return `<div class="bar"><div class="seg">${GEN}</div><div class="sep"></div><div class="seg">${DEP}</div><div class="sep"></div><div class="seg">${GET}</div></div>`;
		case "chips-split":
			return ""; // handled in the head block
		default:
			return `<div class="row">${chip(GEN)}${arrow}${chip(DEP)}${arrow}${chip(GET)}</div>`;
	}
}
const splitColumn = VARIANT === "pictures-split"
	? `<div class="col pics">${STACK}${downArrow}${CODE}${downArrow}<div class="piece get">${GET}</div></div>`
	: `<div class="col">${chip(GEN, "sparkle")}${downArrow}${chip(DEP, "upload")}${downArrow}${chip(GET, "globe")}</div>`;
const headMarkup = IS_SPLIT
	? `<div class="split">
			<div class="head">
				<div class="intro">Introducing</div>
				<div class="lockup"><div class="tile" aria-label="Dynamic Apps">${markSvg.replace(/<\?xml[^>]*\?>/i, "")}</div><div class="name">Dynamic Apps</div></div>
			</div>
			${splitColumn}
		</div>`
	: `<div class="head">
			<div class="intro">Introducing</div>
			<div class="lockup">
				<div class="tile" aria-label="Dynamic Apps">${markSvg.replace(/<\?xml[^>]*\?>/i, "")}</div>
				<div class="name">Dynamic Apps</div>
			</div>
		</div>`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8" /><style>
	@font-face { font-family:"Manrope"; src:url("${dataUrl("font/woff2", sansFont)}") format("woff2"); font-weight:200 800; }
	@font-face { font-family:"JetBrains Mono"; src:url("${dataUrl("font/woff2", monoFont)}") format("woff2"); font-weight:100 800; }
	* { box-sizing:border-box; }
	html, body { margin:0; background:${PAPER}; font-family:"Manrope",sans-serif; color:${INK}; }
	.backdrop { position:absolute; inset:0; width:100%; height:100%; }
	.card > *:not(.backdrop) { position:relative; }
	.card { position:relative; overflow:hidden; width:${WIDTH}px; height:${HEIGHT}px; display:flex; flex-direction:column;
		align-items:center; justify-content:center; gap:112px; padding-bottom:0; }

	/* lockup: ink tile with white mark + wordmark (ProductLockup at ~6×) */
	.head { display:flex; flex-direction:column; align-items:center; gap:28px; }
	.intro { font-size:44px; font-weight:500; color:${INK_SOFT}; letter-spacing:-0.005em; }
	.lockup { display:flex; align-items:center; gap:52px; }
	.tile { width:184px; height:184px; border-radius:34.375%; background:${PRODUCT}; display:flex; align-items:center; justify-content:center; }
	.tile svg { width:100%; height:100%; display:block; }
	.name { font-size:150px; font-weight:500; letter-spacing:-0.015em; line-height:1; }

	/* explainer row */
	.row { display:flex; align-items:flex-start; gap:${px(28)}; }
	.step { display:flex; flex-direction:column; align-items:center; }
	.stage { display:flex; align-items:center; justify-content:center; height:${px(176)}; }
	.label { margin-top:${px(18)}; font-size:${px(20)}; font-weight:500; color:${INK}; letter-spacing:-0.01em; }
	.row > .arrow { margin-top:${px(82)}; }
	.row { align-items:center; }
	.row > .arrow { margin-top:0; }
	.arrow { width:${px(40)}; height:${px(12)}; display:block; flex:none; }
	.piece { background:#fff; border-radius:${px(8)}; box-shadow:0 0 0 1.5px rgba(27,25,22,0.16); }

	/* file stack */
	.stack { position:relative; width:${px(168)}; height:${px(160)}; flex:none; }
	.fc { position:absolute; height:${px(96)}; padding:${px(8)}; background:#fff; border-radius:${px(8)}; box-shadow:0 0 0 1.5px rgba(27,25,22,0.16); }
	.fc.back  { top:${px(4)};  left:0;        right:${px(24)}; transform:rotate(-6deg); z-index:1; }
	.fc.mid   { top:${px(20)}; left:${px(24)}; right:0;        transform:rotate(6deg);  z-index:2; }
	.fc.front { top:${px(40)}; left:${px(12)}; right:${px(12)}; z-index:3; }
	.fh { display:flex; align-items:center; gap:${px(6)}; }
	.ib { width:${px(20)}; height:${px(20)}; border-radius:${px(4)}; display:flex; align-items:center; justify-content:center; flex:none; }
	.ib.ts { background:#3178c6; color:#fff; font-weight:700; font-size:${px(7)}; align-items:flex-end; justify-content:flex-end; padding:${px(2)}; }
	.ic { width:${px(14)}; height:${px(14)}; display:block; }
	.fn { font-family:"JetBrains Mono",monospace; font-size:${px(11)}; color:${INK}; }
	.fl { margin-top:${px(12)}; display:flex; flex-direction:column; gap:${px(6)}; }
	.lr { display:flex; align-items:center; gap:${px(4)}; }
	.ln { display:block; height:${px(4)}; border-radius:999px; }
	.caret { display:block; width:${px(1)}; height:${px(8)}; background:rgba(27,25,22,0.6); }

	/* code chip */
	.code { padding:${px(10)} ${px(14)}; font-family:"JetBrains Mono",monospace; font-size:${px(11)}; line-height:1.6; color:${INK}; white-space:pre; flex:none; }
	.kw { color:${KW}; } .str { color:${STR}; } .f { color:${FN}; }

	/* chips variant */
	.chip { padding:${px(12)} ${px(18)}; font-family:"JetBrains Mono",monospace; font-size:${px(14)}; line-height:1.4; color:${INK}; white-space:nowrap; display:flex; align-items:center; gap:${px(12)}; }
	.chip .m { color:${INK_SOFT}; }
	.chip .pill { margin-left:${px(2)}; font-size:${px(12)}; padding:${px(3)} ${px(8)}; }

	/* chip variants */
	.chip .ci { width:${px(16)}; height:${px(16)}; display:block; flex:none; color:${PINE}; }
	.ink .chip { background:${INK}; color:#F4F1E7; box-shadow:none; }
	.ink .chip .f { color:#93A286; } .ink .chip .m { color:rgba(244,241,231,0.6); } .ink .chip .pill { background:#93A286; color:${INK}; }
	.ink .arrow { stroke:rgba(27,25,22,0.5); }
	.bar { display:flex; align-items:center; background:#fff; border-radius:${px(10)}; box-shadow:0 0 0 1.5px rgba(27,25,22,0.16); overflow:hidden; }
	.bar .seg { padding:${px(14)} ${px(22)}; font-family:"JetBrains Mono",monospace; font-size:${px(14)}; line-height:1.4; color:${INK}; white-space:nowrap; display:flex; align-items:center; gap:${px(12)}; }
	.bar .sep { width:1.5px; align-self:stretch; background:rgba(27,25,22,0.12); }
	.bar .seg .m { color:${INK_SOFT}; }
	.split { display:flex; align-items:center; gap:140px; }
	.split .head { align-items:flex-start; }
	.split .name { font-size:132px; }
	.split .tile { width:160px; height:160px; }
	.split { gap:120px; }
	.split .col { display:flex; flex-direction:column; align-items:stretch; gap:${px(8)}; }
	.split .col .chip { justify-content:flex-start; }
	.split .down { width:${px(12)}; height:${px(22)}; display:block; align-self:center; margin:0; }
	.split .chip { font-size:${px(15)}; padding:${px(13)} ${px(18)}; gap:${px(12)}; }
	.split .chip .ci { width:${px(18)}; height:${px(18)}; }
	.split .head { gap:22px; }
	.split .col.pics { align-items:center; gap:${px(10)}; }
	.split .col.pics .stack { height:${px(136)}; margin:0; }
	.split .col.pics .get { width:auto; font-size:${px(13)}; padding:${px(10)} ${px(16)}; }
	.split:has(.pics) { gap:150px; }
	.split:has(.pics) .down { height:${px(20)}; }
	.split .col.pics .route { width:${px(232)}; }

	/* route */
	.route { width:${px(232)}; flex:none; display:flex; flex-direction:column; gap:${px(8)}; }
	.get { display:flex; align-items:center; white-space:nowrap; gap:${px(8)}; padding:${px(8)} ${px(14)}; font-family:"JetBrains Mono",monospace; font-size:${px(11)}; line-height:1.6; }
	.get .m { color:${INK_SOFT}; } .get .p { color:${INK}; }
	.pill { margin-left:auto; background:${PINE}; color:#fff; border-radius:999px; padding:${px(2)} ${px(6)}; font-size:${px(10)}; font-weight:500; line-height:1; font-family:"Manrope",sans-serif; }
	.browser { overflow:hidden; }
	.bar { display:flex; align-items:center; gap:${px(6)}; padding:${px(6)} ${px(8)}; border-bottom:1px solid rgba(27,25,22,0.08); }
	.dots { display:flex; gap:${px(4)}; } .dots i { width:${px(6)}; height:${px(6)}; border-radius:999px; background:rgba(27,25,22,0.22); display:block; }
	.url { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; border-radius:${px(4)}; background:rgba(27,25,22,0.05); box-shadow:0 0 0 1px rgba(27,25,22,0.10); padding:${px(2)} ${px(6)}; font-family:"JetBrains Mono",monospace; font-size:${px(10)}; color:${INK_SOFT}; }
	.page { padding:${px(10)}; display:flex; flex-direction:column; gap:${px(8)}; }
	.hd { display:flex; align-items:center; justify-content:space-between; }
	.hd .t { display:block; height:${px(6)}; width:33%; border-radius:999px; background:rgba(27,25,22,0.22); }
	.hd .b { display:block; height:${px(12)}; width:${px(32)}; border-radius:${px(4)}; background:${PINE}; }
	.cards { display:grid; grid-template-columns:1fr 1fr; gap:${px(6)}; }
	.pc { border-radius:${px(4)}; background:rgba(27,25,22,0.05); box-shadow:0 0 0 1px rgba(27,25,22,0.10); padding:${px(6)}; display:flex; flex-direction:column; gap:${px(5)}; }
</style></head><body>
	<main class="card">
		${backdropSvg}
		${headMarkup}
		${IS_SPLIT || IS_PLAIN ? "" : IS_CHIPS ? chipsMarkup() : `
		<div class="row">
			<div class="step"><div class="stage"><div class="stack">
				${fileCard({ cls: "back", icon: icons.node, lines: ["80%", "60%"] })}
				${fileCard({ cls: "mid", icon: icons.ts, lines: ["75%", "50%"] })}
				${fileCard({ cls: "front", icon: icons.react, name: "App.tsx", lines: ["83%", "66%", "75%"], caret: true })}
			</div></div></div>
			${arrow}
			<div class="step"><div class="stage"><div class="piece code"><span class="kw">await</span> <span class="f">deployApp</span>({
  appId: <span class="str">"pied-piper"</span>,
  files,
});</div></div></div>
			${arrow}
			<div class="step"><div class="stage"><div class="route">
				<div class="piece get"><span><span class="m">GET</span> <span class="p">/apps/pied-piper</span></span><span class="pill">200</span></div>
				<div class="piece browser">
					<div class="bar"><span class="dots"><i></i><i></i><i></i></span><span class="url">acme.dev/apps/pied-piper</span></div>
					<div class="page">
						<div class="hd"><span class="t"></span><span class="b"></span></div>
						<div class="cards">
							<div class="pc">${skel("50%", true)}${skel("100%")}${skel("75%")}</div>
							<div class="pc">${skel("50%", true)}${skel("100%")}${skel("75%")}</div>
						</div>
						${skel("83%")}
					</div>
				</div>
			</div></div></div>
		</div>`}
	</main>
</body></html>`;

await mkdir(OUT_DIR, { recursive: true });
await writeFile(path.join(OUT_DIR, `${OUT_NAME}.html`), html);
const chromium = await loadChromium();
const browser = await chromium.launch({ headless: true, executablePath: CHROMIUM });
try {
	const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
	await page.setContent(html, { waitUntil: "load" });
	await page.evaluate(() => document.fonts.ready);
	await page.screenshot({ path: path.join(OUT_DIR, `${OUT_NAME}.png`), fullPage: false });
	await page.close();
} finally {
	await browser.close();
}
console.log(`wrote ${path.join(OUT_DIR, `${OUT_NAME}.png`)}`);
