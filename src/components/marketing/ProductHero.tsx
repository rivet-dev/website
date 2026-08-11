import { ProductMark } from "@/components/ProductBar";
import { getProduct } from "@/sitemap/products";
import { ProductHeroCta } from "./ProductHeroCta";

/**
 * The shared product hero: mark, title, subtitle, CTA pair.
 *
 * Modelled on the agentOS hero, which leads with the logo and lets the headline
 * make a claim. The product's *name* lives in the mark, so the title should say
 * something rather than repeat it.
 */
export function ProductHero({
	productId,
	title,
	subtitle,
	installCommand,
	setupHref,
}: {
	productId: string;
	/** Defaults to the product's tagline, the same line the switcher shows. */
	title?: string;
	subtitle: string;
	installCommand: string;
	setupHref: string;
}) {
	const product = getProduct(productId);
	const heading = title ?? product?.description ?? "";

	return (
		<section className="relative flex min-h-[92svh] flex-col justify-center overflow-hidden bg-paper px-6 pb-28 pt-44 md:pb-32 md:pt-52">
			<div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
				{product && (
					<div className="mb-7 flex">
						<ProductMark product={product} className="h-11 w-auto md:h-12" />
					</div>
				)}

				<h1 className="mb-4 max-w-4xl text-balance text-4xl font-medium leading-[1.06] tracking-[-0.02em] text-ink md:text-5xl">
					{heading}
				</h1>

				<p className="mb-7 max-w-3xl text-base leading-relaxed text-ink-soft md:text-lg">
					{subtitle}
				</p>

				<ProductHeroCta command={installCommand} setupHref={setupHref} />
			</div>
		</section>
	);
}
