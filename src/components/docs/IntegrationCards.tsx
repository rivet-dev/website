import { integrationsFor } from "@/data/integrations";

/**
 * Card grid on a product's Integrations overview page. Reads the same list the
 * sidebar is built from, so a new integration appears in both at once.
 */
export function IntegrationCards({ product }: { product: string }) {
	const items = integrationsFor(product);

	return (
		<div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
			{items.map((item) => (
				<a
					key={item.slug}
					href={`/${product}/integrations/${item.slug}`}
					className="group flex gap-4 rounded-lg border border-ink/10 bg-white/55 p-4 no-underline transition-colors hover:border-ink/25"
				>
					<img
						src={item.icon.src}
						alt=""
						aria-hidden="true"
						className="mt-0.5 size-8 flex-shrink-0 rounded"
					/>
					<div className="min-w-0">
						<div className="flex items-center gap-2">
							<span className="text-[15px] font-medium text-ink">{item.title}</span>
							{item.badge ? (
								<span className="shrink-0 rounded-full border border-ink/15 px-1.5 py-0.5 text-[10px] text-ink-faint">
									{item.badge}
								</span>
							) : null}
						</div>
						<p className="mt-1 text-[13px] leading-snug text-ink-soft">
							{item.description}
						</p>
					</div>
				</a>
			))}
		</div>
	);
}
