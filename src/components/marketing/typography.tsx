import type { ReactNode } from 'react';

// Canonical marketing typography. These class strings are the single source of
// truth for heading treatment on marketing surfaces. Use them (or SectionHeading)
// instead of hand-writing tracking and weight classes on new pages.

// Hero H1 on porcelain marketing pages.
export const HERO_H1_CLASS =
	'text-4xl font-medium leading-[1.06] tracking-[-0.015em] text-ink text-balance md:text-6xl';

// Section H2 on porcelain marketing pages.
export const SECTION_H2_CLASS =
	'text-3xl font-medium tracking-[-0.015em] text-ink md:text-4xl';

// Muted subtitle that sits under a hero or section heading.
export const SUBTITLE_CLASS = 'mt-4 text-base leading-relaxed text-ink-soft';

// Letter-spaced mono eyebrow, the museum-catalog section label. Pine on
// porcelain; use text-sage when the eyebrow sits inside an ink panel.
export const EYEBROW_CLASS =
	'font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-pine';

// Printed catalog caption, e.g. "Fig. 02 — Rivet Inspector".
export const CAPTION_CLASS = 'font-mono text-xs text-ink-faint';

// Product hero, matching the agentOS hero shell. Centered on the porcelain
// field, viewport-tied height, with a single heading, one description
// paragraph, and the shared CTA pair below it.
export const PRODUCT_HERO_SECTION_CLASS =
	'relative flex min-h-[68svh] flex-col items-center justify-center overflow-hidden bg-paper px-6 py-16 md:py-20';
export const PRODUCT_HERO_INNER_CLASS =
	'mx-auto flex w-full max-w-5xl flex-col items-center text-center';
export const PRODUCT_HERO_H1_CLASS =
	'mb-4 max-w-5xl text-balance text-4xl font-medium leading-[1.06] tracking-[-0.02em] text-ink md:text-5xl';
export const PRODUCT_HERO_SUBTITLE_CLASS =
	'mb-7 max-w-3xl text-base leading-relaxed text-ink-soft md:text-lg';
export const PRODUCT_HERO_CTA_ROW_CLASS =
	'flex w-full flex-col flex-wrap items-center gap-x-4 gap-y-3 sm:flex-row sm:justify-center';

// The two buttons every product hero carries. Same treatment as the agentOS
// hero's primary action and its ghost companion.
const PRODUCT_HERO_BUTTON_BASE =
	'inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors sm:w-auto';
export const PRODUCT_HERO_PRIMARY_BUTTON_CLASS =
	`${PRODUCT_HERO_BUTTON_BASE} selection-dark bg-accent-deep text-white hover:bg-accent`;
export const PRODUCT_HERO_SECONDARY_BUTTON_CLASS =
	`${PRODUCT_HERO_BUTTON_BASE} border border-ink/15 bg-white/55 text-ink-soft hover:border-ink/30 hover:bg-white hover:text-ink`;

interface SectionHeadingProps {
	title: ReactNode;
	subtitle?: ReactNode;
	eyebrow?: ReactNode;
	index?: string;
	className?: string;
}

export const SectionHeading = ({ title, subtitle, eyebrow, index, className }: SectionHeadingProps) => (
	<div className={className}>
		{eyebrow ? (
			<p className={`${EYEBROW_CLASS} mb-4`}>
				{index ? <span className="text-ink-faint">{index} — </span> : null}
				{eyebrow}
			</p>
		) : null}
		<h2 className={SECTION_H2_CLASS}>{title}</h2>
		{subtitle ? <p className={SUBTITLE_CLASS}>{subtitle}</p> : null}
	</div>
);
