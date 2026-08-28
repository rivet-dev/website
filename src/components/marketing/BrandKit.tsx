"use client";

// Interactive pieces of the brand page. The surrounding headings, section
// rules, and copy live in `src/pages/brand.astro`; only the bits that need a
// browser (copy-to-clipboard, the canonical `ProductBadge`) are hydrated here.
import { toast } from "@rivet-gg/components";
import { Icon, faCopy, faDownload } from "@rivet-gg/icons";
import { products } from "@/sitemap/products";
import { productAccent } from "@/lib/product-accent";
import { ProductBadge } from "@/components/ProductBar";

// The corporate marks. White-on-transparent badge + wordmark SVGs; imported so
// Vite resolves the hashed URLs (`.src`) the same way the header and footer do.
import iconTextBlack from "@/images/rivet-logos/icon-text-black.svg";
import iconTextWhite from "@/images/rivet-logos/icon-text-white.svg";
import iconMark from "@/images/rivet-logos/icon-white.svg";

async function copyText(text: string, label: string) {
	try {
		await navigator.clipboard.writeText(text);
		toast.success(`Copied ${label}`);
	} catch {
		toast.error("Couldn’t copy to clipboard.");
	}
}

async function copySvg(src: string, name: string) {
	try {
		const svg = await (await fetch(src)).text();
		await navigator.clipboard.writeText(svg);
		toast.success(`Copied ${name} as SVG`);
	} catch {
		toast.error("Couldn’t copy the SVG.");
	}
}

function hexToRgb(hex: string): string {
	const [r, g, b] = [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));
	return `rgb(${r}, ${g}, ${b})`;
}

const ASSET_BUTTON_CLASS =
	"inline-flex items-center gap-1.5 rounded-md border border-ink/15 bg-white/55 px-2.5 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-ink/30 hover:bg-white hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

// --- Logos -----------------------------------------------------------------

interface LogoAsset {
	title: string;
	usage: string;
	src: string;
	file: string;
	/** Which ground the preview sits on. */
	ground: "light" | "dark";
	/** Height utility for the preview image. */
	imgClass: string;
}

const LOGOS: LogoAsset[] = [
	{
		title: "Wordmark",
		usage: "Primary lockup for light backgrounds",
		src: iconTextBlack.src,
		file: "rivet-wordmark-dark.svg",
		ground: "light",
		imgClass: "h-9 w-auto md:h-10",
	},
	{
		title: "Wordmark",
		usage: "Primary lockup for dark backgrounds",
		src: iconTextWhite.src,
		file: "rivet-wordmark-light.svg",
		ground: "dark",
		imgClass: "h-9 w-auto md:h-10",
	},
	{
		title: "Icon",
		usage: "The mark alone, for constrained space",
		src: iconMark.src,
		file: "rivet-icon.svg",
		ground: "light",
		imgClass: "h-16 w-16",
	},
];

// agentOS is the one product with a full script wordmark (beyond its badge),
// so it rides in the product-marks section rather than the Rivet logo gallery.
const AGENTOS_WORDMARK_SRC = "/images/agent-os/agentos-wordmark.svg";

export function LogoGallery() {
	return (
		<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{LOGOS.map((logo) => (
				<figure
					key={logo.file}
					className="flex flex-col overflow-hidden rounded-xl border border-ink/10 bg-white/55"
				>
					<div
						className={`flex h-44 items-center justify-center border-b border-ink/10 ${
							logo.ground === "dark" ? "ink-grain bg-ink" : "bg-white"
						}`}
					>
						<img src={logo.src} alt={`Rivet ${logo.title.toLowerCase()}`} className={logo.imgClass} />
					</div>
					<figcaption className="flex flex-1 items-end justify-between gap-3 p-5">
						<div>
							<div className="text-sm font-medium text-ink">{logo.title}</div>
							<div className="mt-0.5 text-xs text-ink-faint">{logo.usage}</div>
						</div>
						<div className="flex shrink-0 gap-1.5">
							<button
								type="button"
								onClick={() => copySvg(logo.src, `Rivet ${logo.title.toLowerCase()}`)}
								className={ASSET_BUTTON_CLASS}
							>
								<Icon icon={faCopy} className="h-3 w-3" />
								SVG
							</button>
							<a href={logo.src} download={logo.file} className={ASSET_BUTTON_CLASS}>
								<Icon icon={faDownload} className="h-3 w-3" />
								Download
							</a>
						</div>
					</figcaption>
				</figure>
			))}
		</div>
	);
}

// --- Product marks ---------------------------------------------------------

// Display order matches the sitemap (Rivet Cloud is hidden from the switcher
// but still carried, so it is pulled in explicitly).
const PRODUCT_ORDER = ["actors", "agentos", "workflows", "dynamic-apps", "cloud"];

// Standalone, accent-colored versions of each badge (tile baked in), generated
// under public/images/brand/ so the marks are downloadable exactly as shown.
const markSrc = (id: string) => `/images/brand/${id}-mark.svg`;

export function ProductMarkGallery() {
	const ordered = PRODUCT_ORDER.map((id) => products.find((product) => product.id === id)).filter(
		(product): product is NonNullable<typeof product> => Boolean(product),
	);

	return (
		<div className="flex flex-col gap-4">
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
				{ordered.map((product) => {
					const accent = productAccent(product.id);
					const hex = accent?.hex ?? "#1B1916";
					return (
						<div
							key={product.id}
							className="flex flex-col items-center gap-4 rounded-xl border border-ink/10 bg-white/55 p-6 text-center"
						>
							<ProductBadge product={product} className="size-14" />
							<div className="flex flex-col items-center gap-1">
								<div className="flex items-center gap-1.5">
									<span className="text-sm font-medium text-ink">{product.name}</span>
									{product.badge ? (
										<span className="rounded-full border border-ink/15 px-1.5 py-0.5 text-[10px] font-medium leading-none text-ink-faint">
											{product.badge}
										</span>
									) : null}
								</div>
								<button
									type="button"
									onClick={() => copyText(hex.toUpperCase(), hex.toUpperCase())}
									className="rounded-sm font-mono text-xs text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
								>
									{hex.toUpperCase()}
								</button>
							</div>
							<div className="flex flex-wrap justify-center gap-1.5">
								<button
									type="button"
									onClick={() => copySvg(markSrc(product.id), `${product.name} mark`)}
									className={ASSET_BUTTON_CLASS}
								>
									<Icon icon={faCopy} className="h-3 w-3" />
									SVG
								</button>
								<a
									href={markSrc(product.id)}
									download={`rivet-${product.id}-mark.svg`}
									aria-label={`Download ${product.name} mark`}
									className={ASSET_BUTTON_CLASS}
								>
									<Icon icon={faDownload} className="h-3 w-3" />
								</a>
							</div>
						</div>
					);
				})}
			</div>
			<div className="flex flex-col items-start gap-4 rounded-xl border border-ink/10 bg-white/55 p-6 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-5">
					<img src={AGENTOS_WORDMARK_SRC} alt="agentOS wordmark" className="h-10 w-auto md:h-11" />
					<div>
						<div className="text-sm font-medium text-ink">agentOS wordmark</div>
						<div className="mt-0.5 text-xs text-ink-faint">The agentOS script mark</div>
					</div>
				</div>
				<div className="flex shrink-0 gap-1.5">
					<button
						type="button"
						onClick={() => copySvg(AGENTOS_WORDMARK_SRC, "agentOS wordmark")}
						className={ASSET_BUTTON_CLASS}
					>
						<Icon icon={faCopy} className="h-3 w-3" />
						SVG
					</button>
					<a href={AGENTOS_WORDMARK_SRC} download="agentos-wordmark.svg" className={ASSET_BUTTON_CLASS}>
						<Icon icon={faDownload} className="h-3 w-3" />
						Download
					</a>
				</div>
			</div>
		</div>
	);
}

// --- Colors ----------------------------------------------------------------

interface Swatch {
	name: string;
	hex: string;
	token: string;
	/** Set when the fill is close to the page so the block needs a hairline. */
	pale?: boolean;
}

// The porcelain editorial palette. Source of truth is `tailwind.config.ts`
// (`theme.extend.colors`); restated here so the swatches can display and copy
// literal values.
const COLOR_GROUPS: { label: string; colors: Swatch[] }[] = [
	{
		label: "Surfaces",
		colors: [
			{ name: "Paper", hex: "#EFEFEF", token: "paper", pale: true },
			{ name: "Paper mid", hex: "#E3E3E5", token: "paper-mid", pale: true },
			{ name: "Paper deep", hex: "#DCDCDE", token: "paper-deep", pale: true },
			{ name: "Cream", hex: "#F4F1E7", token: "cream", pale: true },
		],
	},
	{
		label: "Ink & text",
		colors: [
			{ name: "Ink", hex: "#1B1916", token: "ink" },
			{ name: "Ink soft", hex: "#56524A", token: "ink-soft" },
			{ name: "Ink faint", hex: "#8A8478", token: "ink-faint" },
		],
	},
	{
		label: "Rivet orange",
		colors: [
			{ name: "Accent", hex: "#CB5A33", token: "accent" },
			{ name: "Accent deep", hex: "#AB451F", token: "accent-deep" },
		],
	},
	{
		label: "Rivet green",
		colors: [
			{ name: "Pine", hex: "#2E4034", token: "pine" },
			{ name: "Olive", hex: "#5C6B4F", token: "olive" },
			{ name: "Sage", hex: "#93A286", token: "sage" },
		],
	},
];

function SwatchTile({ swatch }: { swatch: Swatch }) {
	const hex = swatch.hex.toUpperCase();
	return (
		<button
			type="button"
			onClick={() => copyText(hex, hex)}
			className="group flex flex-col rounded-xl border border-ink/10 bg-white/55 p-2.5 text-left transition-colors hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
		>
			<span
				className={`block h-20 w-full rounded-lg ${swatch.pale ? "border border-ink/10" : ""}`}
				style={{ backgroundColor: swatch.hex }}
			/>
			<span className="mt-3 flex flex-col gap-0.5">
				<span className="text-sm font-medium text-ink">{swatch.name}</span>
				<span className="flex items-center gap-1.5 font-mono text-xs text-ink-soft">
					{hex}
					<Icon
						icon={faCopy}
						className="h-3 w-3 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100"
					/>
				</span>
				<span className="font-mono text-[11px] text-ink-faint">{hexToRgb(swatch.hex)}</span>
			</span>
		</button>
	);
}

export function ColorPalette() {
	return (
		<div className="flex flex-col gap-10">
			{COLOR_GROUPS.map((group) => (
				<div key={group.label}>
					<h3 className="mb-4 text-sm font-medium text-ink">{group.label}</h3>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
						{group.colors.map((swatch) => (
							<SwatchTile key={swatch.token} swatch={swatch} />
						))}
					</div>
				</div>
			))}
		</div>
	);
}
