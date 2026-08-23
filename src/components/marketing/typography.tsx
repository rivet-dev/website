import type { ReactNode } from 'react';

// Canonical marketing typography. These class strings are the single source of
// truth for heading treatment on marketing surfaces. Use them (or SectionHeading)
// instead of hand-writing tracking and weight classes on new pages.

// Hero H1 on porcelain marketing pages.
export const HERO_H1_CLASS =
	'text-balance text-[2.25rem] font-medium leading-[1.06] tracking-[-0.015em] text-ink md:text-[3.5rem]';

// Shared H2 metric. Keep the color separate so light and ink surfaces can use
// the same balanced typography without competing text-color utilities.
export const SECTION_H2_BASE_CLASS =
	'text-balance text-[1.75rem] font-medium leading-tight tracking-[-0.015em] md:text-[2rem]';
export const SECTION_H2_CLASS = `${SECTION_H2_BASE_CLASS} text-ink`;

// Muted subtitle that sits under a hero or section heading.
export const SUBTITLE_CLASS =
	'mt-4 text-balance text-[17px] leading-relaxed text-ink-soft';

// Section lede under an H2, at the agentOS metric. Left-aligned and centered
// variants; margins are baked in so callers never append competing spacing.
export const SECTION_LEDE_CLASS =
	'mt-5 max-w-xl text-balance text-[17px] leading-relaxed text-ink-soft';
export const SECTION_LEDE_CENTERED_CLASS =
	'mx-auto mt-5 max-w-3xl text-balance text-[17px] leading-relaxed text-ink-soft';

// Default long-form and card copy on site surfaces. Labels and captions use
// the quieter 14px and 12px metrics below instead.
export const BODY_CLASS = 'text-[15px] leading-relaxed text-ink-soft';

// Quiet section label: plain sans, sentence case, no letterspacing. The old
// mono uppercase eyebrow (and its numbered "Fig. NN" variants) is retired.
export const EYEBROW_CLASS = 'text-sm font-medium text-ink-faint';

// The same label inside dark ink panels.
export const EYEBROW_ON_INK_CLASS = 'text-sm font-medium text-cream/60';

// Image and plate caption. Sans, sentence case, no figure numbering.
export const CAPTION_CLASS = 'text-xs text-ink-faint';

// Shared title metric for marketing cards and horizontal callouts.
export const CARD_TITLE_BASE_CLASS =
	'text-lg font-medium leading-snug tracking-[-0.01em] md:text-xl';
export const CARD_TITLE_CLASS = `${CARD_TITLE_BASE_CLASS} text-ink`;

// Product hero, matching the agentOS hero shell: centered on the porcelain
// field with a single heading, one description paragraph, and the shared CTA
// pair below it. No min-height — the hero visual sets the depth.
export const PRODUCT_HERO_SECTION_CLASS =
	'depth-wash relative flex flex-col justify-center overflow-hidden bg-paper px-4 pb-24 pt-36 md:px-12 md:pb-28 md:pt-44 min-[1681px]:px-14';
export const PRODUCT_HERO_INNER_CLASS =
	'mx-auto flex w-full max-w-5xl flex-col items-center text-center';
export const PRODUCT_HERO_H1_CLASS =
	'mb-4 max-w-5xl text-balance text-[2.25rem] font-medium leading-[1.06] tracking-[-0.015em] text-ink md:text-5xl';
export const PRODUCT_HERO_SUBTITLE_CLASS =
	'mb-7 max-w-3xl text-balance text-[17px] leading-relaxed text-ink-soft';
export const PRODUCT_HERO_CTA_ROW_CLASS =
	'flex w-full flex-col flex-wrap items-center gap-x-4 gap-y-3 sm:flex-row sm:justify-center';

// The two buttons every product hero carries. Same treatment as the agentOS
// hero's primary action and its ghost companion.
const PRODUCT_HERO_BUTTON_BASE =
	'inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors motion-reduce:transition-none sm:w-auto';
const PAPER_BUTTON_FOCUS_CLASS =
	'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine/60 focus-visible:ring-offset-2 focus-visible:ring-offset-paper';
const INK_BUTTON_FOCUS_CLASS =
	'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink';
export const PRODUCT_HERO_PRIMARY_BUTTON_CLASS =
	`${PRODUCT_HERO_BUTTON_BASE} ${PAPER_BUTTON_FOCUS_CLASS} selection-dark bg-accent-deep text-white hover:bg-accent-deep/90`;
export const PRODUCT_HERO_SECONDARY_BUTTON_CLASS =
	`${PRODUCT_HERO_BUTTON_BASE} ${PAPER_BUTTON_FOCUS_CLASS} border border-ink/15 bg-white/55 text-ink-soft hover:border-ink/30 hover:bg-white hover:text-ink`;

// Solid warm-black primary for pages whose single accent ember is spent
// elsewhere. Same metric as the hero pair.
export const PRIMARY_INK_BUTTON_CLASS =
	`${PRODUCT_HERO_BUTTON_BASE} ${PAPER_BUTTON_FOCUS_CLASS} selection-paper bg-ink text-cream hover:bg-ink/85`;

// Buttons inside dark ink panels (the closing CTA colophon): light-on-ink
// primary and its cream ghost companion, per the agentOS closing band.
export const INK_PANEL_LIGHT_BUTTON_CLASS =
	`${PRODUCT_HERO_BUTTON_BASE} ${INK_BUTTON_FOCUS_CLASS} selection-dark bg-white text-ink hover:bg-white/90`;
export const INK_PANEL_GHOST_BUTTON_CLASS =
	`${PRODUCT_HERO_BUTTON_BASE} ${INK_BUTTON_FOCUS_CLASS} border border-cream/25 text-cream hover:border-cream/50 hover:bg-cream/[0.04]`;

// Compact header controls: one h-8 metric for every control in the site
// header (search trigger, GitHub, Sign In) so the row reads as a single
// instrument cluster. Page CTAs keep the px-4 py-2 metric above.
const HEADER_CONTROL_BASE =
	'inline-flex h-8 items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 text-sm font-medium transition-colors motion-reduce:transition-none';
export const HEADER_SECONDARY_BUTTON_CLASS =
	`${HEADER_CONTROL_BASE} ${PAPER_BUTTON_FOCUS_CLASS} border border-ink/15 bg-white/55 text-ink-soft hover:border-ink/30 hover:bg-white hover:text-ink`;
export const HEADER_PRIMARY_INK_BUTTON_CLASS =
	`${HEADER_CONTROL_BASE} ${PAPER_BUTTON_FOCUS_CLASS} selection-paper bg-ink text-cream hover:bg-ink/85`;

interface SectionHeadingProps {
	title: ReactNode;
	subtitle?: ReactNode;
	eyebrow?: ReactNode;
	className?: string;
	subtitleClassName?: string;
}

export const SectionHeading = ({
	title,
	subtitle,
	eyebrow,
	className,
	subtitleClassName = SUBTITLE_CLASS,
}: SectionHeadingProps) => (
	<div className={className}>
		{eyebrow ? <p className={`${EYEBROW_CLASS} mb-4`}>{eyebrow}</p> : null}
		<h2 className={SECTION_H2_CLASS}>{title}</h2>
		{subtitle ? <p className={subtitleClassName}>{subtitle}</p> : null}
	</div>
);
