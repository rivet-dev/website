import type { GuideSlots, SlotName } from "@/sitemap/selfHostSlots";

/**
 * Renders one named product slot inside a shared self-host guide. Guides are
 * authored once and generated per product, so `<ProductSlot name="caveats" />`
 * is the only place product-specific copy may appear.
 *
 * The component is bound to a product's resolved slots by the route and passed
 * into `<Content components={...} />`, so a guide body never sees product state.
 */
export function createProductSlot(slots: GuideSlots) {
	return function ProductSlot({ name }: { name: SlotName }) {
		const value = slots[name];
		if (!value) return null;

		// Caveats are the one slot that needs to interrupt the reader.
		if (name === "caveats") {
			return (
				<div className="mdx-callout my-4 rounded-lg border border-ink/15 bg-white/55 px-4 py-3 text-sm text-ink-soft">
					{value}
				</div>
			);
		}

		return <p className="text-sm text-ink-soft">{value}</p>;
	};
}
