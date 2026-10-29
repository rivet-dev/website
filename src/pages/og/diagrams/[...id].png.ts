// Link preview cards for docs pages that draw a `<Diagram>`: the Rivet wordmark,
// the page title, and the page's first diagram in its summary form
// (`DiagramMini`, the Guides overview thumbnail), rendered to a PNG at build
// time. `DocsArticlePage` points those pages here, so a diagram added to any
// product's docs gets its card without a committed PNG.
//
// The layout follows the cards from `scripts/render-og-images.ts`. Those are
// screenshotted in Chromium; this route has no browser, so sharp draws the SVG
// and sets the title with Pango, which needs Manrope as a TTF.
import path from 'node:path';
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import sharp from 'sharp';
import { DiagramMini } from '@/components/docs/diagram/Diagram';
import { diagramFromMdx, type DiagramSpec } from '@/components/docs/diagram/fromMdx';
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '@/lib/ogImage';
import rivetLogo from '@/images/rivet-logos/icon-text-black.svg?raw';

const W = OG_IMAGE_WIDTH;
const H = OG_IMAGE_HEIGHT;
const MARGIN_X = 200;
const LOGO = { y: 150, height: 72 };
const TITLE_Y = 300;
const PANEL_GAP = 80;
const PANEL_BOTTOM = H - 130;
const PANEL_PADDING = 64;
const FONT_FILE = path.join(process.cwd(), 'public/fonts/manrope/Manrope-Variable.ttf');

// Site palette (tailwind.config.ts / theme.css, light theme).
const PAPER = '#EFEFEF';
const PAPER_DEEP = '#DCDCDE';
const INK = '#1B1916';

export const getStaticPaths = (async () => {
	const entries = await getCollection('docs');
	return entries.flatMap((entry) => {
		const diagram = diagramFromMdx(entry.body);
		return diagram
			? [{ params: { id: entry.id }, props: { diagram, title: entry.data.title as string } }]
			: [];
	});
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
	const { diagram, title } = props as { diagram: DiagramSpec; title: string };

	// Same sizes as the static cards: smaller type for long headlines.
	const size = title.length > 44 ? 108 : 124;
	const { data: titlePng, info: titleInfo } = await sharp({
		text: {
			text: `<span foreground="${INK}" letter_spacing="${Math.round(-0.015 * size * 1024)}">${escapeXml(title)}</span>`,
			font: `Manrope ${size} @wght=500`,
			fontfile: FONT_FILE,
			width: W - MARGIN_X * 2,
			dpi: 72,
			rgba: true,
		},
	})
		.png()
		.toBuffer({ resolveWithObject: true });

	const panel = {
		x: MARGIN_X,
		y: TITLE_Y + titleInfo.height + PANEL_GAP,
		w: W - MARGIN_X * 2,
		h: 0,
	};
	panel.h = PANEL_BOTTOM - panel.y;

	const mini = renderToStaticMarkup(createElement(DiagramMini, diagram))
		// Diagram colors are site tokens with the light palette as fallback. No
		// stylesheet defines the tokens here, so use the fallbacks.
		.replace(/var\(--[\w-]+,\s*([^)]+)\)/g, '$1');
	const logoWidth = (LOGO.height * 204) / 68;

	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
		<defs>
			<radialGradient id="wash" cx="0" cy="${H}" r="${W * 1.15}" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 ${H}) scale(1 ${(1.05 * H) / (1.15 * W)}) translate(0 ${-H})">
				<stop offset="0" stop-color="${PAPER_DEEP}"/>
				<stop offset="0.58" stop-color="${PAPER_DEEP}" stop-opacity="0"/>
			</radialGradient>
			<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.045 0"/></filter>
		</defs>
		<rect width="100%" height="100%" fill="${PAPER}"/>
		<rect width="100%" height="100%" fill="url(#wash)"/>
		<rect width="100%" height="100%" filter="url(#grain)"/>
		<svg x="${MARGIN_X}" y="${LOGO.y}" width="${logoWidth}" height="${LOGO.height}" viewBox="0 0 204 68">${svgInner(rivetLogo)}</svg>
		<rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${panel.h}" rx="28" fill="#ffffff" fill-opacity="0.55" stroke="${INK}" stroke-opacity="0.1" stroke-width="3"/>
		<svg x="${panel.x + PANEL_PADDING}" y="${panel.y + PANEL_PADDING}" width="${panel.w - PANEL_PADDING * 2}" height="${panel.h - PANEL_PADDING * 2}">${mini}</svg>
	</svg>`;

	const png = await sharp(Buffer.from(svg))
		.composite([{ input: titlePng, left: MARGIN_X, top: TITLE_Y }])
		.png()
		.toBuffer();
	// Quantize in a second pass, as the static cards do, to stay well under the
	// 1 MB crawler-friendly ceiling.
	const quantized = await sharp(png)
		.png({ palette: true, quality: 80, dither: 0.4, compressionLevel: 9, effort: 10 })
		.toBuffer();
	return new Response(new Uint8Array(quantized), { headers: { 'Content-Type': 'image/png' } });
};

function svgInner(source: string): string {
	return source.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
}

function escapeXml(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
