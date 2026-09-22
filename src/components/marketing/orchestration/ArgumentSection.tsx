"use client";

import type { ReactNode } from "react";
import { Reveal } from "../motion";
import { SITE_SECTION_CLASS, SITE_STANDARD_RAIL_CLASS } from "../layout";
import { CAPTION_CLASS, SECTION_H2_CLASS } from "../typography";
import { canonicalizeInternalHref } from "@/lib/internalHref";

/**
 * The shell every orchestrator argument shares: a claim on one side, the
 * figure that demonstrates it on the other.
 *
 * Kept as one component so the five arguments cannot drift in rhythm, and so
 * alternating sides is a prop rather than a duplicated layout. Text leads on
 * odd sections and trails on even ones; on narrow screens the claim always
 * comes first.
 */
interface ArgumentSectionProps {
	/** Anchor target for the matching hero stat. */
	id?: string;
	heading: ReactNode;
	lede: ReactNode;
	/** Headline figure beside the claim, e.g. "5 ms". Optional. */
	stat?: { value: string; unit?: string; note?: string };
	/** Quiet reading links under the lede, for the depth this section skips. */
	links?: { label: string; href: string }[];
	figure: ReactNode;
	/** Caption under the figure. Sentence case, no figure numbering. */
	caption?: ReactNode;
	/** Puts the figure on the left at desktop widths. */
	figureFirst?: boolean;
}

export const ArgumentSection = ({
	id,
	heading,
	lede,
	stat,
	links,
	figure,
	caption,
	figureFirst = false,
}: ArgumentSectionProps) => (
	<section
		id={id}
		className={`scroll-mt-24 bg-paper ${SITE_SECTION_CLASS}`}
	>
		<div className={SITE_STANDARD_RAIL_CLASS}>
			<div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
				<Reveal className={figureFirst ? "lg:order-2" : undefined}>
					<h2 className={SECTION_H2_CLASS}>{heading}</h2>
					<p className="mt-5 max-w-xl text-balance text-[17px] leading-relaxed text-ink-soft">
						{lede}
					</p>
					{stat ? (
						<div className="mt-8 flex items-baseline gap-2">
							<span className="text-[2.75rem] font-medium leading-none tracking-[-0.02em] tabular-nums text-ink md:text-5xl">
								{stat.value}
							</span>
							{stat.unit ? (
								<span className="text-lg font-medium text-ink-faint md:text-xl">
									{stat.unit}
								</span>
							) : null}
						</div>
					) : null}
					{stat?.note ? (
						<p className={`mt-3 ${CAPTION_CLASS}`}>{stat.note}</p>
					) : null}
					{links?.length ? (
						<ul className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
							{links.map((link) => (
								<li key={link.href}>
									<a
										href={canonicalizeInternalHref(link.href)}
										className="group inline-flex items-center gap-1.5 text-sm text-ink-faint transition-colors hover:text-ink"
									>
										{link.label}
										<span
											aria-hidden="true"
											className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
										>
											→
										</span>
									</a>
								</li>
							))}
						</ul>
					) : null}
				</Reveal>

				<Reveal
					delay={0.1}
					className={figureFirst ? "lg:order-1" : undefined}
				>
					<figure className="rounded-xl border border-ink/10 bg-white/55 p-6 md:p-8">
						{figure}
						{caption ? (
							<figcaption className={`mt-6 ${CAPTION_CLASS}`}>
								{caption}
							</figcaption>
						) : null}
					</figure>
				</Reveal>
			</div>
		</div>
	</section>
);
