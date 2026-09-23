import { integrationGroups, type Integration } from "@/data/integrations";
import { canonicalizeInternalHref } from "@/lib/internalHref";

function slugify(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
}

/**
 * A product's Integrations overview, generated from the same category groups
 * the sidebar is built from: one heading per sidebar section, then a card per
 * page in it. Adding an integration to `src/data/integrations.ts` updates both.
 */
export function IntegrationCards({ product }: { product: string }) {
	return (
		<>
			{integrationGroups(product).map((group) => (
				<section key={group.title}>
					<h2 id={slugify(group.title)}>{group.title}</h2>
					<div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
						{group.items.map((item) => (
							<IntegrationCard key={item.slug} product={product} item={item} />
						))}
					</div>
				</section>
			))}
		</>
	);
}

function IntegrationCard({ product, item }: { product: string; item: Integration }) {
	return (
		<a
			href={canonicalizeInternalHref(`/${product}/integrations/${item.slug}`)}
			className="group flex gap-4 rounded-lg border border-ink/10 bg-white/55 p-4 no-underline transition-colors hover:border-ink/25"
		>
			{/* Vendor marks are ink-on-transparent; invert to white on dark. */}
			<img
				src={item.icon.src}
				alt=""
				aria-hidden="true"
				className="theme-monochrome-logo mt-0.5 size-8 flex-shrink-0 rounded"
			/>
			<div className="min-w-0">
				<div className="flex items-center gap-2">
					<span className="text-[15px] font-medium text-ink">{item.title}</span>
					{item.badge ? (
						<span className="shrink-0 rounded border border-ink/15 px-1.5 py-px text-[11px] font-medium leading-4 text-ink-faint">
							{item.badge}
						</span>
					) : null}
				</div>
				<p className="mt-1 text-[13px] leading-snug text-ink-soft">{item.description}</p>
			</div>
		</a>
	);
}
