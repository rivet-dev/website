import {
	Icon,
	faRobot,
	faDiagramNext,
	faTerminal,
	faSparkles,
} from "@rivet-gg/icons";
import { ArrowUpRight } from "lucide-react";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { productAccent } from "@/lib/product-accent";
import {
	BODY_CLASS,
	CARD_TITLE_BASE_CLASS,
	SectionHeading,
} from "../typography";
import { ProductMotif, type ProductMotifId } from "../ProductMotif";
import { SITE_SECTION_CLASS, SITE_STANDARD_RAIL_CLASS } from "../layout";
import { canonicalizeInternalHref } from "@/lib/internalHref";

/**
 * The starting points the orchestrator is used through, three across and two
 * down.
 *
 * These are actor types, not products: Actors is the primitive being
 * orchestrated, so it gets no plate of its own. Each type borrows the accent
 * and motif of the product that owns it. The last two cells of the grid are
 * wayfinders rather than plates — see `wayfinders` below.
 */
interface ActorPlate {
	/** Accent and motif to borrow. */
	motifId: ProductMotifId;
	/** Pill above the name. */
	kind: string;
	name: string;
	premise: string;
	href: string;
	icon: IconDefinition;
	badge?: string;
}

/** Vendor marks on the registry plate, as evidence it is populated. */
const registryMarks = [
	{ src: "/images/vendors/durable-streams.svg", label: "Durable Streams" },
	{ src: "/images/vendors/eve.svg", label: "Vercel Eve" },
	{ src: "/images/vendors/workflow.svg", label: "Vercel Workflow SDK" },
	{ src: "/images/vendors/flue.svg", label: "Flue" },
];

const plates: ActorPlate[] = [
	{
		motifId: "actors",
		kind: "Actor",
		name: "Agents",
		premise: "A durable process per agent, with memory that survives restarts",
		href: "/registry/agent-actor/",
		icon: faRobot,
	},
	{
		motifId: "workflows",
		kind: "Actor",
		name: "Workflows",
		premise: "Multi-step operations that replay instead of starting over",
		href: "/workflows/",
		icon: faDiagramNext,
	},
	{
		motifId: "agentos",
		kind: "Actor",
		name: "Sandboxes",
		premise: "A filesystem, shell, and network for code you did not write",
		href: "/agentos/",
		icon: faTerminal,
	},
	{
		motifId: "dynamic-apps",
		kind: "Actor",
		name: "Dynamic apps",
		premise: "A backend per user, deployed the moment it is generated",
		href: "/dynamic-apps/",
		icon: faSparkles,
		badge: "Preview",
	},
];

/**
 * The two ways past the list. Deliberately not actor plates: no accent, no
 * kind pill, no mark — a quiet paper tile with centered text and an arrow, so
 * the four real actor types stay the only colored things in the grid.
 */
const wayfinders = [
	{ label: "Explore more actors", href: "/registry/", marks: true },
	{ label: "Build your own actor", href: "/actors/docs/", marks: false },
];

export const ActorTypesSection = () => (
	<section className={`relative bg-paper ${SITE_SECTION_CLASS}`}>
		<div className={SITE_STANDARD_RAIL_CLASS}>
			<div data-site-reveal="">
				<SectionHeading
					title="Whatever the workload, there&rsquo;s an actor for it."
					subtitle="Four are maintained by Rivet. The registry holds the rest."
					className="max-w-2xl"
				/>
			</div>

			<div
				data-site-reveal-group=""
				className="mt-8 grid gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3"
			>
				{plates.map((plate) => {
					const accent = productAccent(plate.motifId);
					return (
						<a
							key={plate.name}
							href={canonicalizeInternalHref(plate.href)}
							data-site-reveal-child=""
							className="group flex min-w-0 flex-col focus-visible:outline-none"
						>
							<div
								className={`relative flex min-h-[168px] flex-col justify-between gap-6 overflow-hidden rounded-xl p-5 transition-shadow duration-200 group-focus-visible:ring-2 group-focus-visible:ring-cream/80 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-paper motion-reduce:transition-none sm:aspect-[16/10] sm:min-h-0 sm:gap-0 ${accent?.fill ?? "bg-ink"}`}
							>
								<ProductMotif productId={plate.motifId} surface="card" />
								<span
									aria-hidden="true"
									className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.09] via-transparent to-black/[0.12]"
								/>
								<span className="relative flex items-center gap-2">
									<span className="rounded-full border border-cream/20 bg-cream/10 px-2.5 py-0.5 text-xs font-medium text-cream/90 backdrop-blur-md backdrop-saturate-[1.3] transition-colors duration-300 [transition-timing-function:cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none group-hover:border-cream/35 group-hover:bg-cream/25 group-hover:text-cream">
										{plate.kind}
									</span>
									{plate.badge && (
										<span className="whitespace-nowrap rounded-full border border-cream/20 px-2 py-0.5 text-xs font-medium text-cream/70">
											{plate.badge}
										</span>
									)}
								</span>
								<div className="relative">
									<div className="flex items-center gap-2.5">
										<Icon
											icon={plate.icon}
											aria-hidden="true"
											className="h-5 w-5 shrink-0 text-white"
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
											className="size-7 rounded-full border border-ink/10 bg-white object-contain p-1.5"
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
