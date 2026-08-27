import { Icon } from "@rivet-gg/icons";
import { productLogos } from "@/sitemap/productLogos";
import { wordmarkMaskStyle } from "@/lib/product-accent";
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
				// The asset is white-on-transparent; masking a cream fill over an
				// ink tile reproduces the Rivet badge treatment at hero scale.
				<span
					aria-hidden="true"
					className="flex size-9 shrink-0 items-center justify-center rounded-[34.375%] bg-ink md:size-10"
				>
					<span
						style={wordmarkMaskStyle(logo.src)}
						className="block h-full w-full bg-cream"
					/>
				</span>
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
			{product.badge && (
				<span className="whitespace-nowrap rounded-md border border-ink/15 bg-white/55 px-2 py-1 text-xs font-medium leading-none text-ink-soft">
					{product.badge}
				</span>
			)}
		</span>
	);
}
