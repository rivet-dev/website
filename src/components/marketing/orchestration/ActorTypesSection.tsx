import { ArrowUpRight } from "lucide-react";
import { productAccent, wordmarkMaskStyle } from "@/lib/product-accent";
import { productLogos } from "@/sitemap/productLogos";
import { ACTOR_WAYFINDERS, HOMEPAGE_ACTOR_PLATES } from "@/data/actor-types";
import {
	BODY_CLASS,
	CARD_TITLE_BASE_CLASS,
	SectionHeading,
} from "../typography";
import { ProductMotif, productMotifCardClass } from "../ProductMotif";
import { SITE_SECTION_CLASS, SITE_STANDARD_RAIL_CLASS } from "../layout";
import { canonicalizeInternalHref } from "@/lib/internalHref";

/**
 * The starting points the orchestrator is used through, three across and two
 * down: the four actor types from `src/data/actor-types.ts` (shared with the
 * Documentation menu), then the two wayfinders past the list.
 *
 * Each plate is filled with its product's accent and carries the product's
 * wordmark painted white straight on that field — the plate is the tile, so
 * this is the sanctioned tile-less case (see Product Marks in CLAUDE.md).
 */

/** Vendor marks on the registry plate, as evidence it is populated. */
const registryMarks = [
	{ src: "/images/vendors/durable-streams.svg", label: "Durable Streams" },
	{ src: "/images/vendors/eve.svg", label: "Vercel Eve" },
	{ src: "/images/vendors/workflow.svg", label: "Vercel Workflow SDK" },
	{ src: "/images/vendors/flue.svg", label: "Flue" },
];

/**
 * Deliberately not actor plates: no accent, no badge, no mark — a quiet paper
 * tile with centered text and an arrow, so the four real actor types stay the
 * only colored things in the grid.
 */
const wayfinders = [
	{ ...ACTOR_WAYFINDERS.explore, marks: true },
	{ ...ACTOR_WAYFINDERS.build, marks: false },
];

export const ActorTypesSection = () => (
	<section className={`relative bg-paper ${SITE_SECTION_CLASS}`}>
		<div className={SITE_STANDARD_RAIL_CLASS}>
			<div data-site-reveal="">
				<SectionHeading
					title="Whatever the workload, there&rsquo;s an Actor for it."
					className="max-w-2xl"
				/>
			</div>

			<div
				data-site-reveal-group=""
				className="mt-8 grid gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3"
			>
				{HOMEPAGE_ACTOR_PLATES.map((plate) => {
					const accent = productAccent(plate.accentId ?? plate.id);
					const logo = productLogos[plate.id];
					return (
						<a
							key={plate.id}
							href={canonicalizeInternalHref(plate.href)}
							data-site-reveal-child=""
							className={`group flex min-w-0 flex-col focus-visible:outline-none ${productMotifCardClass[plate.motifId]}`}
						>
							<div
								className={`relative flex min-h-[168px] flex-col justify-between gap-6 overflow-hidden rounded-xl p-5 transition-shadow duration-200 group-focus-visible:ring-2 group-focus-visible:ring-cream/80 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-paper motion-reduce:transition-none sm:aspect-[16/10] sm:min-h-0 sm:gap-0 ${accent?.fill ?? "bg-ink"}`}
							>
								<ProductMotif productId={plate.motifId} surface="card" />
								<span
									aria-hidden="true"
									className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.09] via-transparent to-black/[0.12]"
								/>
								{/* Top row: empty unless a status badge applies, so the name
								    stays anchored to the bottom of the plate. */}
								<span className="relative flex items-center gap-2">
									{plate.badge && (
										<span className="whitespace-nowrap rounded border border-cream/20 px-1.5 py-px text-[11px] font-medium leading-4 text-cream/70">
											{plate.badge}
										</span>
									)}
								</span>
								<div className="relative">
									<div className="flex items-center gap-2.5">
										<span
											aria-hidden="true"
											style={wordmarkMaskStyle(logo.src)}
											className="inline-block h-6 w-6 shrink-0 bg-white"
										/>
										<div className={`${CARD_TITLE_BASE_CLASS} text-cream`}>
											{plate.name}
										</div>
									</div>
									<p
										className={`mt-2 text-balance font-medium !text-cream/90 ${BODY_CLASS}`}
									>
										{plate.premise}
									</p>
								</div>
							</div>
						</a>
					);
				})}

				{wayfinders.map((way) => (
					<a
						key={way.href}
						href={canonicalizeInternalHref(way.href)}
						data-site-reveal-child=""
						className="group flex min-h-[168px] flex-col items-center justify-center gap-3 rounded-xl border border-ink/10 bg-ink/[0.04] p-5 text-center transition-colors duration-200 hover:border-ink/20 hover:bg-ink/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 focus-visible:ring-offset-paper motion-reduce:transition-none sm:aspect-[16/10] sm:min-h-0"
					>
						<span className="inline-flex items-center gap-2 text-base font-medium tracking-tight text-ink">
							{way.label}
							<ArrowUpRight className="h-4 w-4 text-ink-faint transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" />
						</span>
						{way.marks && (
							// Stacked and overlapping, so the row reads as "and more of
							// these" rather than as four separate destinations.
							<ul className="flex items-center pl-1.5">
								{registryMarks.map((mark) => (
									<li key={mark.label} className="-ml-1.5 flex">
										<img
											src={mark.src}
											alt={mark.label}
											title={mark.label}
											loading="lazy"
											className="registry-logo-plate size-7 rounded-full border border-ink/10 bg-white object-contain p-1.5"
										/>
									</li>
								))}
							</ul>
						)}
					</a>
				))}
			</div>
		</div>
	</section>
);
