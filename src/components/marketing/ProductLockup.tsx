import { Icon } from "@rivet-gg/icons";
import { productLogos } from "@/sitemap/productLogos";
import type { Product } from "@/sitemap/products";

/**
 * The product lockup that sits above a hero's headline: the mark, then the
 * product name set as text.
 *
 * No product ships a wordmark with the name baked in — the SVGs in
 * `productLogos` are square glyphs and the other products only have a Font
 * Awesome mark — so the name is typeset here instead. The mark is left its own
 * color rather than tinted with the product accent.
 */
export function ProductLockup({ product }: { product: Product }) {
	const logo = productLogos[product.id];

	return (
		<span className="flex items-center gap-3">
			{logo ? (
				// The asset is white-on-transparent; brightness-0 renders it as ink.
				<img
					src={logo.src}
					alt=""
					aria-hidden="true"
					className="h-9 w-9 shrink-0 brightness-0 md:h-10 md:w-10"
				/>
			) : product.icon ? (
				<Icon
					icon={product.icon}
					aria-hidden="true"
					className="shrink-0 text-[1.75rem] leading-none text-ink md:text-[2rem]"
				/>
			) : null}
			<span className="text-2xl font-medium tracking-[-0.01em] text-ink md:text-3xl">
				{product.name}
			</span>
		</span>
	);
}
