"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/hooks/usePathname";
import { Icon } from "@rivet-gg/icons";
import {
	findProductForPath,
	products,
	visibleTabs,
	type Product,
} from "@/sitemap/products";
import { productLogos } from "@/sitemap/productLogos";
import { productAccent, wordmarkMaskStyle } from "@/lib/product-accent";
import { cn } from "@rivet-gg/components";
import { canonicalizeInternalHref } from "@/lib/internalHref";

/**
 * A product's mark, carrying that product's accent color.
 *
 * The wordmarks are white-on-transparent SVGs, so they are painted as a masked
 * element rather than an `<img>`: the SVG supplies the silhouette and a
 * Tailwind background class supplies the hue. Glyph fallbacks take the same
 * accent as a text color. `tone="white"` is for dark grounds: the accent tile
 * inside `ProductBadge` and the dark Learn shell.
 */
export function ProductMark({
	product,
	className,
	tone = "accent",
}: { product: Product; className?: string; tone?: "accent" | "white" }) {
	const accent = productAccent(product.id);
	const logo = productLogos[product.id];
	if (logo) {
		return (
			<span
				aria-hidden="true"
				style={wordmarkMaskStyle(logo.src)}
				className={cn(
					"inline-block shrink-0",
					tone === "white" ? "bg-white" : (accent?.fill ?? "bg-ink"),
					className,
				)}
			/>
		);
	}
	if (product.icon) {
		return (
			<Icon
				icon={product.icon}
				aria-hidden="true"
				className={cn(
					"shrink-0",
					tone === "white" ? "text-white" : (accent?.text ?? "text-ink-soft"),
					className,
				)}
			/>
		);
	}
	return null;
}

/**
 * The colored product lockup: a solid tile in the product accent with the
 * white mark spanning it. The tile radius (34.375%) and the SVG's inset ring
 * reproduce the Rivet badge geometry, so this is the same treatment as the
 * product bar on each product page. Size comes from the caller (`size-N`).
 *
 * Every place that lists products (header dropdowns, mobile sheet, product
 * bar label, talk-to-an-engineer cluster) renders this rather than a bare
 * `ProductMark`, so the lockup cannot drift between surfaces.
 */
export function ProductBadge({
	product,
	className,
}: { product: Product; className?: string }) {
	const accent = productAccent(product.id);
	return (
		<span
			aria-hidden="true"
			className={cn(
				"flex shrink-0 items-center justify-center rounded-[34.375%]",
				accent?.fill ?? "bg-ink",
				className,
			)}
		>
			<ProductMark product={product} tone="white" className="h-full w-full" />
		</span>
	);
}

/** Which product the subnav belongs to, linking back to its overview. */
function ProductLabel({
	current,
	label,
	active = false,
	dark = false,
	focusable = true,
}: {
	current?: Product;
	/** Used by docs sections that are not a product vertical (integrations). */
	label?: string;
	active?: boolean;
	dark?: boolean;
	/** False while the lockup is hidden, so it cannot be tabbed to. */
	focusable?: boolean;
}) {
	// Same treatment as the Products dropdown: the color is the tile behind the
	// mark, and the mark and name are left uncolored.
	const content = (
		<>
			{current && <ProductBadge product={current} className="size-7" />}
			<span className="font-medium">{current?.name ?? label}</span>
		</>
	);

	if (!current) {
		return <span className={cn("flex h-9 items-center gap-2 pr-1 text-sm", dark ? "text-white" : "text-ink")}>{content}</span>;
	}

	const accent = productAccent(current.id);
	return (
		<a
			href={canonicalizeInternalHref(current.href)}
			aria-current={active ? "page" : undefined}
			tabIndex={focusable ? undefined : -1}
			className={cn(
				"flex h-9 items-center gap-2 rounded-sm pr-1 text-sm transition-colors",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
				dark
					? "text-white hover:text-white/80 focus-visible:ring-white/60 focus-visible:ring-offset-neutral-950"
					: cn("text-ink hover:text-pine focus-visible:ring-offset-paper", accent?.focusRing ?? "focus-visible:ring-pine"),
			)}
		>
			{content}
		</a>
	);
}

/** How long the lockup takes to wipe in. */
const WIPE_MS = 280;

/**
 * The wipe itself, as a mask that slides across the lockup.
 *
 * The mask is three times the element's width: an opaque third, a soft edge,
 * then transparent. Sliding it from `100%` to `0%` walks that soft edge from
 * half a lockup-width left of the mark to half a width past its right edge, so
 * at both ends the mask still covers the whole lockup — fully hidden at one
 * end, fully opaque at the other — and the text is never left sitting under
 * the gradient. Anchoring it to the lockup, whose width never changes, keeps
 * the sweep smooth and independent of the column collapsing beside it.
 */
const WIPE_MASK =
	"linear-gradient(to right, #000 calc(50% - 16px), transparent calc(50% + 16px))";
const WIPE_SIZE = "300% 100%";

function wipeStyle(revealed: boolean): React.CSSProperties {
	const position = revealed ? "0% 0" : "100% 0";
	return {
		maskImage: WIPE_MASK,
		WebkitMaskImage: WIPE_MASK,
		maskSize: WIPE_SIZE,
		WebkitMaskSize: WIPE_SIZE,
		maskRepeat: "no-repeat",
		WebkitMaskRepeat: "no-repeat",
		maskPosition: position,
		WebkitMaskPosition: position,
		transition: `mask-position ${WIPE_MS}ms ease-out, -webkit-mask-position ${WIPE_MS}ms ease-out`,
	};
}

/**
 * On a product's Overview page the hero already carries the product's name and
 * mark, so repeating them in the bar underneath is redundant while the hero is
 * still on screen. The lockup stays collapsed until the page has scrolled past
 * half a viewport, then expands and fades in.
 *
 * Every other tab (Documentation, Self-Host, ...) has no hero, so there the
 * lockup is the only product context and is shown from the start.
 */
function useHeroReveal(enabled: boolean) {
	// Starts revealed when disabled, so a tab without a hero renders the lockup
	// on the server and a failed effect can never leave it hidden for good.
	const [revealed, setRevealed] = useState(!enabled);

	useEffect(() => {
		if (!enabled) {
			setRevealed(true);
			return;
		}

		let frame: number | null = null;
		const measure = () => {
			frame = null;
			setRevealed(window.scrollY > window.innerHeight * 0.5);
		};
		const schedule = () => {
			if (frame === null) frame = window.requestAnimationFrame(measure);
		};

		// Run once on mount: a reload partway down the page, or a back
		// navigation, should arrive with the lockup already in place.
		measure();
		window.addEventListener("scroll", schedule, { passive: true });
		window.addEventListener("resize", schedule, { passive: true });
		return () => {
			if (frame !== null) window.cancelAnimationFrame(frame);
			window.removeEventListener("scroll", schedule);
			window.removeEventListener("resize", schedule);
		};
	}, [enabled]);

	return revealed;
}

/**
 * Second header row inside a product vertical: the product overview link and
 * that product's remaining tabs.
 */
export function ProductBar({
	initialPathname = "",
	productId,
	tabId,
	sectionLabel,
	dark = false,
}: {
	initialPathname?: string;
	productId?: string;
	tabId?: string;
	/** Label for docs sections that are not a product vertical. */
	sectionLabel?: string;
	/** Light-on-dark text, for when the header above it is forced dark. */
	dark?: boolean;
}) {
	// usePathname is empty during SSR and the first client render, so seed it
	// from the Astro-provided pathname.
	const pathname = usePathname() || initialPathname;
	const fromPath = findProductForPath(pathname.replace(/\/$/, ""));
	const product =
		products.find((candidate) => candidate.id === productId) ??
		fromPath?.product;
	const activeTabId = tabId ?? fromPath?.tab.id;
	const revealed = useHeroReveal(activeTabId === "overview");

	if (!product && !sectionLabel) return null;

	return (
		// Quiet Linear-style tab strip sitting directly on the header glass: no
		// band fill, no underline — the active tab is ink, the rest ink-faint,
		// and the product accent lives only in the label tile.
		<div className="hidden h-12 items-center md:flex">
			<div
				aria-hidden={revealed ? undefined : true}
				className={cn(
					"grid transition-[grid-template-columns] ease-out motion-reduce:transition-none",
					revealed ? "grid-cols-[1fr]" : "grid-cols-[0fr]",
				)}
				style={{ transitionDuration: `${WIPE_MS}ms` }}
			>
				{/* The column collapses to zero width; the lockup keeps its natural
				    size (`w-max`) and simply overflows, hidden by the mask rather
				    than by a clip. That keeps the mask on a constant-width element,
				    so its sweep is independent of the width animation. */}
				<div className="min-w-0">
					<div
						className={cn("w-max pr-6", !revealed && "pointer-events-none")}
						style={wipeStyle(revealed)}
					>
						<ProductLabel
							current={product}
							label={sectionLabel}
							active={activeTabId === "overview"}
							dark={dark}
							focusable={revealed}
						/>
					</div>
				</div>
			</div>
			<div className="flex h-full items-center gap-6">
				{product && visibleTabs(product).map((tab) => {
					const accent = productAccent(product.id);
					return (
						<a
							key={tab.id}
							href={canonicalizeInternalHref(tab.href)}
							aria-current={tab.id === activeTabId ? "page" : undefined}
							className={cn(
								"flex h-full items-center rounded-sm text-sm font-medium transition-colors",
								"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
								dark
									? "text-zinc-400 hover:text-white aria-current-page:text-white focus-visible:ring-white/60 focus-visible:ring-offset-neutral-950"
									: cn("text-ink-faint hover:text-ink aria-current-page:text-ink focus-visible:ring-offset-paper", accent?.focusRing ?? "focus-visible:ring-pine"),
							)}
						>
							{tab.title}
						</a>
					);
				})}
			</div>
		</div>
	);
}
