import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

// Rivet BYOC hero in the "Introducing Rivet MCP" layout: eyebrow, ink Rivet
// badge beside the title, and a row of white tiles carrying brand-colored
// provider marks. Writes image.png (2048x1024), social.png (2048x1238) and
// scene.html.
//
//   pnpm render-byoc-hero -- --output-dir /tmp/byoc-hero [--vpc]
//
// --vpc draws a dashed pine "Your VPC" outline around the tile row.
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(SCRIPT_DIR, "../../../..");
const ASSETS = path.resolve(SCRIPT_DIR, "../assets/logos");
const CARD_W = 2048;
const CARD_H = 1024;

const INK = "#1B1916";
const INK_SOFT = "#56524A";
const PAPER = "#EFEFEF";
const PINE = "#2E4034";
const AWS_ORANGE = "#FF9900";
const GCP_BLUE = "#4285F4";
const K8S_BLUE = "#326CE5";
const TERRAFORM_PURPLE = "#7B42BC";

const strip = (s: string) => s.replace(/<\?xml[^>]*\?>/i, "").replace(/<!DOCTYPE[^>]*>/i, "").replace(/<title>[^<]*<\/title>/i, "");
const ensureViewBox = (svg: string) => {
	const open = svg.match(/<svg\b[^>]*>/i)?.[0];
	if (!open || /\bviewBox=/i.test(open)) return svg;
	const w = open.match(/\bwidth="([\d.]+)(px)?"/i)?.[1];
	const h = open.match(/\bheight="([\d.]+)(px)?"/i)?.[1];
	return w && h ? svg.replace(open, open.replace(/<svg\b/i, `<svg viewBox="0 0 ${w} ${h}"`)) : svg;
};
const pathData = (svg: string) => svg.match(/\sd="([^"]+)"/)![1];
const recolor = (svg: string, fill: string) =>
	/\bfill="/i.test(svg.match(/<svg\b[^>]*>/i)![0]) || /<path\b[^>]*fill=/i.test(svg)
		? svg.replace(/fill="#[0-9a-f]{3,6}"/gi, `fill="${fill}"`)
		: svg.replace(/<svg\b/i, `<svg fill="${fill}"`);

// The registry AWS mark is one path: four subpaths for "aws" then two for the
// smile. Split them so the smile can take the brand orange.
function awsMark(svg: string): string {
	const subs = pathData(svg).split("z").filter((s) => s.trim()).map((s) => s + "z");
	const letters = subs.slice(0, 4).join("");
	const smile =
		"M578.59 368.94" + subs[4].replace(/^m[\d.\- ]+/, "") +
		"M607.78 335.65" + subs[5].replace(/^m[\d.\- ]+/, "");
	return `<svg viewBox="0 0 640 512" xmlns="http://www.w3.org/2000/svg"><path d="${letters}" fill="${INK}"/><path d="${smile}" fill="${AWS_ORANGE}"/></svg>`;
}

async function buildHtml(vpc: boolean): Promise<string> {
	const [font, badgeRaw, awsRaw, gcpRaw, k8sRaw, tfRaw] = await Promise.all([
		readFile(path.join(REPO, "public/fonts/manrope/Manrope-Variable-latin.woff2")),
		readFile(path.join(REPO, "src/images/rivet-logos/icon-white.svg"), "utf8"),
		readFile(path.join(REPO, "public/images/registry/deploy-aws-ecs.svg"), "utf8"),
		readFile(path.join(REPO, "public/images/registry/deploy-gcp-cloud-run.svg"), "utf8"),
		readFile(path.join(REPO, "public/images/registry/deploy-kubernetes.svg"), "utf8"),
		readFile(path.join(ASSETS, "terraform.svg"), "utf8"),
	]);
	const badge = ensureViewBox(strip(badgeRaw)).replace(/#f0f0f0\b/gi, "#FFFFFF").replace(/#0f0f0f\b/gi, INK);
	const tiles: { svg: string; scale: number }[] = [
		{ svg: awsMark(strip(awsRaw)), scale: 0.62 },
		{ svg: recolor(strip(gcpRaw), GCP_BLUE), scale: 0.56 },
		{ svg: recolor(strip(k8sRaw), K8S_BLUE), scale: 0.74 },
		{ svg: recolor(strip(tfRaw), TERRAFORM_PURPLE), scale: 0.44 },
	];

	const TILE = 140;
	const GAP = 28;
	const rowW = tiles.length * TILE + (tiles.length - 1) * GAP;
	const rowX = Math.round((CARD_W - rowW) / 2);
	const rowY = vpc ? 656 : 598;
	const tileHtml = tiles
		.map((t, i) => {
			const inner = Math.round(TILE * t.scale);
			return `<div class="tile anim-tile" id="tile${i}" style="left:${rowX + i * (TILE + GAP)}px;top:${rowY}px;width:${TILE}px;height:${TILE}px">
				<div class="mark" style="width:${inner}px;height:${inner}px">${t.svg}</div></div>`;
		})
		.join("");

	const PAD = 44;
	const vpcHtml = vpc
		? `<svg class="vpc" id="vpc" viewBox="0 0 ${CARD_W} ${CARD_H}" xmlns="http://www.w3.org/2000/svg" style="transform-origin:${CARD_W / 2}px ${rowY + TILE / 2}px">
			<rect x="${rowX - PAD}" y="${rowY - PAD - 26}" width="${rowW + PAD * 2}" height="${TILE + PAD * 2 + 26}" rx="34" fill="none" stroke="${PINE}" stroke-width="3" stroke-dasharray="14 12"/>
			<rect x="${CARD_W / 2 - 92}" y="${rowY - PAD - 44}" width="184" height="36" fill="${PAPER}"/>
			<text x="${CARD_W / 2}" y="${rowY - PAD - 16}" text-anchor="middle" font-family="Manrope, sans-serif" font-size="30" font-weight="500" fill="${PINE}">Your VPC</text>
		</svg>`
		: "";

	// Animation: every frame is a pure function of t (seconds), driven from
	// Playwright in --frames mode. Stills never call render().
	const script = `<script>
		const clamp = (x) => Math.min(1, Math.max(0, x));
		const outCubic = (x) => 1 - Math.pow(1 - x, 3);
		const outBack = (x) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
		const seg = (t, a, d) => clamp((t - a) / d);
		window.render = (t) => {
			const fade = 1 - outCubic(seg(t, 4.9, 0.55));
			const h = outCubic(seg(t, 0.0, 0.6));
			for (const id of ["eyebrow", "lockup"]) {
				const el = document.getElementById(id);
				el.style.opacity = String(h * fade);
				el.style.transform = "translateY(" + (1 - h) * 26 + "px)";
			}
			Array.from(document.querySelectorAll(".anim-tile")).forEach((el, i) => {
				const p = seg(t, 0.55 + i * 0.16, 0.5);
				el.style.opacity = String(outCubic(p) * fade);
				el.style.transform = "scale(" + (0.6 + 0.4 * outBack(p)) + ")";
			});
			const vpc = document.getElementById("vpc");
			if (vpc) {
				const p = outCubic(seg(t, 1.35, 0.6));
				vpc.style.opacity = String(p * fade);
				vpc.style.transform = "scale(" + (0.97 + 0.03 * p) + ")";
			}
		};
	</script>`;

	return `<!doctype html><html><head><meta charset="utf-8"><style>
	@font-face { font-family: "Manrope"; src: url("data:font/woff2;base64,${font.toString("base64")}") format("woff2"); font-weight: 200 800; }
	* { box-sizing: border-box; }
	html, body { margin: 0; background: ${PAPER}; }
	.stage { position: relative; width: ${CARD_W}px; height: ${CARD_H}px; overflow: hidden; background: ${PAPER}; }
	.card { position: absolute; left: 0; top: 0; width: ${CARD_W}px; height: ${CARD_H}px; font-family: "Manrope", sans-serif; color: ${INK}; }
	.eyebrow { position: absolute; top: 238px; left: 0; right: 0; margin: 0; text-align: center; font-size: 44px; line-height: 1; font-weight: 500; color: ${INK_SOFT}; }
	.lockup { position: absolute; top: 322px; left: 0; right: 0; display: flex; align-items: center; justify-content: center; gap: 56px; }
	.badge { width: 186px; height: 186px; border-radius: 34.375%; background: ${INK}; display: flex; align-items: center; justify-content: center; }
	.badge svg { display: block; width: 100%; height: 100%; }
	h1 { margin: 0; font-size: 156px; line-height: 1; letter-spacing: -0.015em; font-weight: 500; }
	.tile { position: absolute; border-radius: 30%; background: #FFFFFF; border: 2px solid rgba(27, 25, 22, 0.1); display: flex; align-items: center; justify-content: center; }
	.mark { display: flex; align-items: center; justify-content: center; }
	.mark svg { display: block; width: 100%; height: 100%; }
	svg.vpc { position: absolute; left: 0; top: 0; width: ${CARD_W}px; height: ${CARD_H}px; }
	.card { transform-origin: 0 0; }
	</style></head><body><div class="stage" id="stage"><div class="card" id="card">
	<p class="eyebrow" id="eyebrow">Introducing</p>
	<div class="lockup" id="lockup"><div class="badge">${badge}</div><h1>Rivet BYOC</h1></div>
	${vpcHtml}
	${tileHtml}
	</div></div>${script}</body></html>`;
}

function parseArgs(argv: string[]): { outputDir: string; vpc: boolean; frames?: string } {
	const args = argv[0] === "--" ? argv.slice(1) : argv;
	const opt = (flag: string) => {
		const index = args.indexOf(flag);
		return index >= 0 ? args[index + 1] : undefined;
	};
	const value = opt("--output-dir");
	if (!value) throw new Error("Usage: pnpm render-byoc-hero -- --output-dir <path> [--vpc] [--frames <dir>]");
	const frames = opt("--frames");
	return { outputDir: path.resolve(value), vpc: args.includes("--vpc"), frames: frames ? path.resolve(frames) : undefined };
}

// 1920x1080 frames for the GIF/MP4: the 2048x1024 card scaled to 1920 wide and
// centered vertically. Encode with ffmpeg afterwards (see SKILL.md).
async function renderFrames(html: string, dir: string) {
	const W = 1920;
	const H = 1080;
	const FPS = 30;
	const DURATION = 5.6;
	await mkdir(dir, { recursive: true });
	const browser = await chromium.launch();
	const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
	await page.setContent(html, { waitUntil: "load" });
	await page.evaluate(() => document.fonts.ready);
	await page.evaluate(({ w, h }) => {
		const scale = w / 2048;
		const stage = document.getElementById("stage")!;
		stage.style.width = w + "px";
		stage.style.height = h + "px";
		const card = document.getElementById("card")!;
		card.style.top = Math.round((h - 1024 * scale) / 2) + "px";
		card.style.transform = "scale(" + scale + ")";
	}, { w: W, h: H });
	const frames = Math.round(DURATION * FPS);
	for (let i = 0; i < frames; i++) {
		await page.evaluate((t) => (window as unknown as { render: (t: number) => void }).render(t), i / FPS);
		await page.screenshot({ path: path.join(dir, `f${String(i).padStart(4, "0")}.png`) });
	}
	await browser.close();
	console.log(`wrote ${frames} frames to ${dir}`);
}

async function main() {
	const { outputDir: OUT, vpc, frames } = parseArgs(process.argv.slice(2));
	await mkdir(OUT, { recursive: true });
	const html = await buildHtml(vpc);
	await writeFile(path.join(OUT, "scene.html"), html);
	if (frames) return renderFrames(html, frames);
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
