import { ProductLockup } from "./ProductLockup";
import { getProduct } from "@/sitemap/products";
import {
	PRODUCT_HERO_CTA_ROW_CLASS,
	PRODUCT_HERO_H1_CLASS,
	PRODUCT_HERO_INNER_CLASS,
	PRODUCT_HERO_PRIMARY_BUTTON_CLASS,
	PRODUCT_HERO_SECONDARY_BUTTON_CLASS,
	PRODUCT_HERO_SECTION_CLASS,
	PRODUCT_HERO_SUBTITLE_CLASS,
} from "./typography";

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
	docsHref,
}: {
	productId: string;
	/** Defaults to the product's tagline, the same line the switcher shows. */
	title?: string;
	subtitle: string;
	docsHref: string;
}) {
	const product = getProduct(productId);
	const heading = title ?? product?.description ?? "";

	return (
		<section className={PRODUCT_HERO_SECTION_CLASS}>
			<div className={PRODUCT_HERO_INNER_CLASS}>
				{product && (
					<div className="mb-7 flex">
						<ProductLockup product={product} />
					</div>
				)}

				<h1 className={PRODUCT_HERO_H1_CLASS}>
					{heading}
				</h1>

				<p className={PRODUCT_HERO_SUBTITLE_CLASS}>
					{subtitle}
				</p>

				<div className={PRODUCT_HERO_CTA_ROW_CLASS}>
				<a href={docsHref} className={PRODUCT_HERO_PRIMARY_BUTTON_CLASS}>
					Documentation
					<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
				</a>
				<a
					href="/talk-to-an-engineer"
					className={PRODUCT_HERO_SECONDARY_BUTTON_CLASS}
				>
					Talk to an engineer
				</a>
			</div>
			</div>
		</section>
	);
}
