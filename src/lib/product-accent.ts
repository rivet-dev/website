import { PRODUCTS } from "@/sitemap/product-metadata";

/**
 * Tailwind classes for each product's accent.
 *
 * Written out rather than interpolated (`text-product-${id}`) because Tailwind
 * scans source statically and would not emit classes it never sees as literals.
 * The colors themselves live in `product-metadata.ts`; this only names them.
 */
export interface ProductAccent {
	/** Accent-colored text, e.g. an eyebrow or a link. */
	text: string;
	/** Faint tinted fill for a chip or a hovered row. */
	tint: string;
	/** Hairline border in the accent hue. */
	border: string;
	/** Solid fill, for the small square swatch in the switcher. */
	fill: string;
	/** Underline under a linked word in the hero. */
	underline: string;
	/** Tint applied on hover. Written out because Tailwind cannot scan `hover:${...}`. */
	tintHover: string;
	/** Bottom border on the active docs tab. */
	activeBorder: string;
	/** Hairline border on hover. Literal for the same scanning reason. */
	borderHover: string;
	/** Text color on whichever element carries `aria-current="page"`. */
	activeText: string;
	/** Left rail on the selected sidebar entry. */
	activeBorderLeft: string;
	/** Keyboard focus ring inside the vertical. */
	focusRing: string;
	/** Text color on hover, for links inside the vertical. */
	textHover: string;
	/** Raw hex, for anywhere a class will not do (CSS variables, masks). */
	hex: string;
}

// Written out per product rather than interpolated, because Tailwind scans
// source statically and never emits a class it does not see as a literal.
const CLASSES: Record<string, Omit<ProductAccent, "hex">> = {
	actors: {
		text: "text-product-actors",
		tint: "bg-product-actors-soft",
		border: "border-product-actors-hairline",
		fill: "bg-product-actors",
		underline: "decoration-product-actors",
		tintHover: "hover:bg-product-actors-soft",
		activeBorder: "aria-current-page:border-product-actors",
		borderHover: "hover:border-product-actors-hairline",
		activeText: "aria-current-page:text-product-actors",
		activeBorderLeft: "aria-current-page:border-l-product-actors",
		focusRing: "focus-visible:ring-product-actors",
		textHover: "hover:text-product-actors",
	},
	agentos: {
		text: "text-product-agentos",
		tint: "bg-product-agentos-soft",
		border: "border-product-agentos-hairline",
		fill: "bg-product-agentos",
		underline: "decoration-product-agentos",
		tintHover: "hover:bg-product-agentos-soft",
		activeBorder: "aria-current-page:border-product-agentos",
		borderHover: "hover:border-product-agentos-hairline",
		activeText: "aria-current-page:text-product-agentos",
		activeBorderLeft: "aria-current-page:border-l-product-agentos",
		focusRing: "focus-visible:ring-product-agentos",
		textHover: "hover:text-product-agentos",
	},
	"dynamic-apps": {
		text: "text-product-dynamic-apps",
		tint: "bg-product-dynamic-apps-soft",
		border: "border-product-dynamic-apps-hairline",
		fill: "bg-product-dynamic-apps",
		underline: "decoration-product-dynamic-apps",
		tintHover: "hover:bg-product-dynamic-apps-soft",
		activeBorder: "aria-current-page:border-product-dynamic-apps",
		borderHover: "hover:border-product-dynamic-apps-hairline",
		activeText: "aria-current-page:text-product-dynamic-apps",
		activeBorderLeft: "aria-current-page:border-l-product-dynamic-apps",
		focusRing: "focus-visible:ring-product-dynamic-apps",
		textHover: "hover:text-product-dynamic-apps",
	},
	workflows: {
		text: "text-product-workflows",
		tint: "bg-product-workflows-soft",
		border: "border-product-workflows-hairline",
		fill: "bg-product-workflows",
		underline: "decoration-product-workflows",
		tintHover: "hover:bg-product-workflows-soft",
		activeBorder: "aria-current-page:border-product-workflows",
		borderHover: "hover:border-product-workflows-hairline",
		activeText: "aria-current-page:text-product-workflows",
		activeBorderLeft: "aria-current-page:border-l-product-workflows",
		focusRing: "focus-visible:ring-product-workflows",
		textHover: "hover:text-product-workflows",
	},
	cloud: {
		text: "text-product-cloud",
		tint: "bg-product-cloud-soft",
		border: "border-product-cloud-hairline",
		fill: "bg-product-cloud",
		underline: "decoration-product-cloud",
		tintHover: "hover:bg-product-cloud-soft",
		activeBorder: "aria-current-page:border-product-cloud",
		borderHover: "hover:border-product-cloud-hairline",
		activeText: "aria-current-page:text-product-cloud",
		activeBorderLeft: "aria-current-page:border-l-product-cloud",
		focusRing: "focus-visible:ring-product-cloud",
		textHover: "hover:text-product-cloud",
	},
};

const ACCENTS: Record<string, ProductAccent> = Object.fromEntries(
	PRODUCTS.filter((product) => CLASSES[product.id]).map((product) => [
		product.id,
		{ ...CLASSES[product.id], hex: product.color },
	]),
);

export function productAccent(productId?: string): ProductAccent | undefined {
	return productId ? ACCENTS[productId] : undefined;
}

/**
 * Inline style that paints an accent-colored silhouette of a wordmark.
 *
 * The product wordmarks are white-on-transparent SVGs, so their alpha channel
 * is exactly the shape of the mark. Masking a plain element with the SVG and
 * filling that element with the accent color tints the mark to any hue, which a
 * filter chain cannot do for an arbitrary color. The fill itself stays a
 * Tailwind class (`accent.fill`) so the color is never interpolated into a
 * class name.
 */
export function wordmarkMaskStyle(src: string) {
	return {
		maskImage: `url(${src})`,
		WebkitMaskImage: `url(${src})`,
		maskRepeat: "no-repeat",
		WebkitMaskRepeat: "no-repeat",
		maskPosition: "center",
		WebkitMaskPosition: "center",
		maskSize: "contain",
		WebkitMaskSize: "contain",
	} as const;
}
