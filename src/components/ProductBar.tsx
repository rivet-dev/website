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
}: {
	current?: Product;
	/** Used by docs sections that are not a product vertical (integrations). */
	label?: string;
	active?: boolean;
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
		return <span className="flex h-9 items-center gap-2 pr-1 text-sm text-ink">{content}</span>;
	}

	const accent = productAccent(current.id);
	return (
		<a
			href={canonicalizeInternalHref(current.href)}
			aria-current={active ? "page" : undefined}
			className={cn(
				"flex h-9 items-center gap-2 rounded-sm pr-1 text-sm text-ink transition-colors hover:text-pine",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
				accent?.focusRing ?? "focus-visible:ring-pine",
			)}
		>
			{content}
		</a>
	);
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
			<ProductLabel current={product} label={sectionLabel} active={activeTabId === "overview"} />
			<div className="flex h-full items-center gap-6">
				{product && visibleTabs(product).map((tab) => {
					const accent = productAccent(product.id);
					return (
						<a
							key={tab.id}
							href={canonicalizeInternalHref(tab.href)}
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
