/**
 * Product variation in the self-host guides enters only through these named
 * slots. A guide body is authored once and generated for every product; the
 * differences are filled in here.
 *
 * If a product needs a sixth slot, that guide genuinely forks. Do not widen the
 * template further.
 *
 * The slots exist before the first real guide ships on purpose. The failure mode
 * for templated docs is not the template, it is the day someone needs a
 * product-specific caveat, finds no slot, forks the file, and nobody notices.
 */
export type SlotName =
	| "requirements"
	| "env"
	| "snippet"
	| "caveats"
	| "verify";

export type GuideSlots = Partial<Record<SlotName, string>>;

/** Slots that apply to every guide for a product. */
const PRODUCT_SLOTS: Record<string, GuideSlots> = {
	actors: {},
	agentos: {},
	"dynamic-apps": {},
	workflows: {},
};

/** Slots scoped to one product on one guide, keyed `${productId}:${guideSlug}`. */
const GUIDE_SLOTS: Record<string, GuideSlots> = {};

export function slotsFor(productId: string, guideSlug: string): GuideSlots {
	return {
		...PRODUCT_SLOTS[productId],
		...GUIDE_SLOTS[`${productId}:${guideSlug}`],
	};
}
