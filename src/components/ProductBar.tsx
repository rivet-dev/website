"use client";

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

/**
 * A product's mark, carrying that product's accent color.
 *
 * The wordmarks are white-on-transparent SVGs, so they are painted as a masked
 * element rather than an `<img>`: the SVG supplies the silhouette and a
 * Tailwind background class supplies the hue. Glyph fallbacks take the same
 * accent as a text color. `tone="cream"` is for the dark Learn shell and the
 * dark mobile sheet, where the muted accents would sink into the background.
 */
export function ProductMark({
	product,
	className,
	tone = "accent",
}: { product: Product; className?: string; tone?: "accent" | "cream" }) {
	const accent = productAccent(product.id);
	const logo = productLogos[product.id];
	if (logo) {
		return (
			<span
				aria-hidden="true"
				style={wordmarkMaskStyle(logo.src)}
				className={cn(
					"inline-block shrink-0",
					tone === "cream" ? "bg-cream" : (accent?.fill ?? "bg-ink"),
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
					tone === "cream" ? "text-cream" : (accent?.text ?? "text-ink-soft"),
					className,
				)}
			/>
		);
	}
	return null;
}

/**
 * Which product the subnav belongs to.
 *
 * Not a switcher: `Products` in the top row is the one place products are
 * chosen, so a second control here was the same menu twice, one line apart.
 */
function ProductLabel({
	current,
	label,
}: {
	current?: Product;
	/** Used by docs sections that are not a product vertical (integrations). */
	label?: string;
}) {
	const accent = current ? productAccent(current.id) : undefined;

	// Same treatment as the Products dropdown: the color is the tile behind the
	// mark, and the mark and name are left uncolored.
	return (
		<span className="flex h-9 items-center gap-2 pr-1 text-sm text-ink">
			{current && (
				<span
					aria-hidden="true"
					className={cn(
						"flex size-7 shrink-0 items-center justify-center rounded-lg",
						accent?.fill ?? "bg-ink/20",
					)}
				>
					<ProductMark
						product={current}
						className="h-[15px] w-[15px]"
						tone="cream"
					/>
				</span>
			)}
			<span className="font-medium">{current?.name ?? label}</span>
			{current?.badge && (
				<span className="px-[6px] py-0 text-[10px] font-medium bg-ink/[0.06] border border-ink/10 text-ink-soft rounded-sm whitespace-nowrap">
					{current.badge}
				</span>
			)}
		</span>
	);
}

/**
 * Second header row inside a product vertical: which product you are in, a
 * switcher to jump to the same tab of another product, and that product's three
 * docs tabs.
 */
export function ProductBar({
	initialPathname = "",
	productId,
	tabId,
	sectionLabel,
}: {
	initialPathname?: string;
	productId?: string;
	tabId?: string;
	/** Label for docs sections that are not a product vertical. */
	sectionLabel?: string;
}) {
	// usePathname is empty during SSR and the first client render, so seed it
	// from the Astro-provided pathname.
	const pathname = usePathname() || initialPathname;
	const fromPath = findProductForPath(pathname.replace(/\/$/, ""));
	const product =
		products.find((candidate) => candidate.id === productId) ??
		fromPath?.product;
	const activeTabId = tabId ?? fromPath?.tab.id;

	if (!product && !sectionLabel) return null;

	return (
		// Quiet Linear-style tab strip sitting directly on the header glass: no
		// band fill, no underline — the active tab is ink, the rest ink-faint,
		// and the product accent lives only in the label tile.
		<div className="hidden h-12 items-center gap-6 md:flex">
			<ProductLabel current={product} label={sectionLabel} />
			<div className="flex h-full items-center gap-6">
				{product && visibleTabs(product).map((tab) => {
					const accent = productAccent(product.id);
					return (
						<a
							key={tab.id}
							href={tab.href}
							aria-current={tab.id === activeTabId ? "page" : undefined}
							className={cn(
								"flex h-full items-center rounded-sm text-sm font-medium text-ink-faint transition-colors hover:text-ink aria-current-page:text-ink",
								"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
								accent?.focusRing ?? "focus-visible:ring-pine",
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
