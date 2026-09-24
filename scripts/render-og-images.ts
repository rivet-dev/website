/**
 * Renders every Open Graph card in `src/lib/ogImage.ts` to
 * `public/images/og/<id>.png` (2400x1260, the 1200x630 social size at 2x).
 *
 *   pnpm render:og            # all cards
 *   pnpm render:og default    # one or more card ids
 *
 * The card is plain HTML on the site's porcelain surface, set in Manrope from
 * `public/fonts/`, with product marks from `public/images/brand/`. Playwright
 * drives Chromium: set CHROMIUM_PATH to a browser binary, otherwise the script
 * looks for the agent-browser Chrome, a system chromium, or Playwright's own
 * download. Output PNGs are committed so the site build stays hermetic.
 */
import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";
import sharp from "sharp";

import {
	OG_CARDS,
	OG_IMAGE_HEIGHT,
	OG_IMAGE_WIDTH,
	type OgCard,
} from "../src/lib/ogImage";
import { getProductMetadata } from "../src/sitemap/product-metadata";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT_DIR = path.join(ROOT, "public/images/og");
const FONT_DIR = path.join(ROOT, "public/fonts/manrope");

// Site palette (tailwind.config.ts / theme.css, light theme).
const PAPER = "#EFEFEF";
const PAPER_DEEP = "#DCDCDE";
const INK = "#1B1916";
const INK_SOFT = "#56524A";

const dataUrl = (mime: string, bytes: Buffer) =>
	`data:${mime};base64,${bytes.toString("base64")}`;

async function exists(file: string): Promise<boolean> {
	try {
		await access(file);
		return true;
	} catch {
		return false;
	}
}

async function findChromium(): Promise<string | undefined> {
	if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
	for (const candidate of ["/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome"]) {
		if (await exists(candidate)) return candidate;
	}
	// agent-browser (preinstalled in Amp orbs) keeps Chrome for Testing here.
	const agentBrowser = path.join(process.env.HOME ?? "", ".agent-browser/browsers");
	if (await exists(agentBrowser)) {
		const dirs = (await readdir(agentBrowser)).filter((d) => d.startsWith("chrome-")).sort();
		const latest = dirs.at(-1);
		if (latest) {
			const binary = path.join(agentBrowser, latest, "chrome");
			if (await exists(binary)) return binary;
		}
	}
	// Fall back to Playwright's managed browser (`pnpm exec playwright install chromium`).
	return undefined;
}

const MIME_BY_EXT: Record<string, string> = {
	".webp": "image/webp",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".svg": "image/svg+xml",
};

/** Inline a file under `public/` (given as its site path, e.g. `/images/x.webp`). */
async function publicDataUrl(sitePath: string): Promise<string> {
	const mime = MIME_BY_EXT[path.extname(sitePath).toLowerCase()];
	if (!mime) throw new Error(`Unsupported image type: ${sitePath}`);
	return dataUrl(mime, await readFile(path.join(ROOT, "public", sitePath)));
}

interface Assets {
	fontCss: string;
	rivetLogo: string;
}

async function loadAssets(): Promise<Assets> {
	const [manrope, rivetLogo] = await Promise.all([
		readFile(path.join(FONT_DIR, "Manrope-Variable-latin.woff2")),
		readFile(path.join(ROOT, "src/images/rivet-logos/icon-text-black.svg")),
	]);
	return {
		fontCss: `@font-face { font-family: "Manrope"; font-weight: 200 800; src: url(${dataUrl("font/woff2", manrope)}) format("woff2"); }`,
		rivetLogo: dataUrl("image/svg+xml", rivetLogo),
	};
}

async function lockupHtml(card: OgCard, assets: Assets): Promise<string> {
	if (!card.productId) {
		// 204x68 wordmark, sized to the same cap height as the product lockup.
		return `<img class="rivet" src="${assets.rivetLogo}" alt="Rivet" />`;
	}
	const meta = getProductMetadata(card.productId);
	if (!meta) throw new Error(`Unknown product ${card.productId}`);
	const mark = await readFile(path.join(ROOT, `public/images/brand/${card.productId}-mark.svg`));
	// The product owns the lockup; the parent brand sits quietly top-right.
	return `<div class="lockup">
		<img class="mark" src="${dataUrl("image/svg+xml", mark)}" alt="" />
		<span class="name">${escapeHtml(meta.name)}</span>
	</div>
	<img class="rivet rivet-corner" src="${assets.rivetLogo}" alt="Rivet" />`;
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

async function cardHtml(card: OgCard, assets: Assets): Promise<string> {
	const lockup = await lockupHtml(card, assets);
	const art = card.art
		? `<img class="art" src="${await publicDataUrl(card.art.src)}" alt="${escapeHtml(card.art.alt)}" />`
		: "";
	// Text keeps to the left half when the cutout stands on the right; otherwise
	// it can run wider, but never past a comfortable measure.
	const textWidth = card.art ? 1140 : 1720;
	const headlineSize = card.headline.length > 44 ? 108 : 124;

	return `<!doctype html>
<html><head><meta charset="utf-8" />
<style>
	${assets.fontCss}
	* { box-sizing: border-box; margin: 0; padding: 0; }
	html, body { width: ${OG_IMAGE_WIDTH}px; height: ${OG_IMAGE_HEIGHT}px; overflow: hidden; }
	body {
		position: relative;
		font-family: "Manrope", system-ui, sans-serif;
		color: ${INK};
		background-color: ${PAPER};
		/* .depth-wash: paper-deep pooling bottom-left, as on every marketing page. */
		background-image: radial-gradient(115% 105% at 0% 100%, ${PAPER_DEEP} 0%, rgba(220, 220, 222, 0) 58%);
	}
	/* .paper-grain */
	body::before {
		content: ""; position: absolute; inset: 0; pointer-events: none;
		background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.045 0'/></filter><rect width='240' height='240' filter='url(%23n)'/></svg>");
	}
	.page {
		position: relative; height: 100%;
		padding: 180px 200px 160px;
		display: flex; flex-direction: column; justify-content: center; align-items: flex-start;
	}
	.rivet { height: 72px; width: auto; display: block; }
	.rivet-corner { position: absolute; top: 160px; right: 200px; height: 56px; opacity: 0.85; }
	.lockup { display: flex; align-items: center; gap: 30px; }
	.mark { width: 108px; height: 108px; border-radius: 34.375%; display: block; }
	.name { font-size: 64px; font-weight: 500; letter-spacing: -0.01em; color: ${INK}; }
	.copy { margin-top: 88px; max-width: ${textWidth}px; }
	h1 {
		font-size: ${headlineSize}px; font-weight: 500; line-height: 1.06;
		letter-spacing: -0.015em; text-wrap: balance; color: ${INK};
	}
	p {
		margin-top: 44px; font-size: 46px; font-weight: 400; line-height: 1.4;
		color: ${INK_SOFT}; text-wrap: pretty;
	}
	/* Transparent cutout standing on the field, feet at the bottom edge, as on
	   the talk-to-an-engineer hero. The source has its own clear margin, so
	   it hangs slightly below the frame to sit flush. */
	.art {
		position: absolute; right: 140px; bottom: -30px; height: 1200px; width: auto;
		object-fit: contain; display: block;
	}
</style></head>
<body>
	<div class="page">
		${lockup}
		<div class="copy">
			<h1>${escapeHtml(card.headline)}</h1>
			<p>${escapeHtml(card.supporting)}</p>
		</div>
	</div>
	${art}
</body></html>`;
}

async function main() {
	const requested = process.argv.slice(2).filter((arg) => arg !== "--");
	const cards = requested.length
		? OG_CARDS.filter((card) => requested.includes(card.id))
		: OG_CARDS;
	const missing = requested.filter((id) => !OG_CARDS.some((card) => card.id === id));
	if (missing.length) throw new Error(`Unknown card id(s): ${missing.join(", ")}`);

	await mkdir(OUT_DIR, { recursive: true });
	const assets = await loadAssets();
	const executablePath = await findChromium();
	const browser = await chromium.launch({ executablePath });
	try {
		const page = await browser.newPage({
			viewport: { width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT },
			deviceScaleFactor: 1,
		});
		for (const card of cards) {
			await page.setContent(await cardHtml(card, assets), { waitUntil: "load" });
			await page.evaluate(() => document.fonts.ready);
			const raw = await page.screenshot({ type: "png" });
			// Quantized PNG: flat surfaces plus grain compress far better as a
			// palette image and stay well under the 1 MB crawler-friendly ceiling.
			const png = await sharp(raw)
				.png({ palette: true, quality: 80, dither: 0.4, compressionLevel: 9, effort: 10 })
				.toBuffer();
			const file = path.join(OUT_DIR, `${card.id}.png`);
			await writeFile(file, png);
			console.log(`${path.relative(ROOT, file)}  ${(png.byteLength / 1024).toFixed(0)} KB`);
		}
	} finally {
		await browser.close();
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
