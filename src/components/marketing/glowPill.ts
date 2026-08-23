import type { MouseEvent } from 'react';

// Structural classes a porcelain pill needs for the cursor-following border
// glow: `relative` anchors the ::after, and `glow-pill` owns the ::after (see
// main.css) which lights ONLY the pill's border ring as the cursor moves. No
// `overflow-hidden` here — it would clip the border-aligned ring. Append to a
// pill's existing className.
const GLOW_PILL_CLASS = 'glow-pill relative';

// The full porcelain pill surface: structural glow classes plus the hairline
// ring, paper fill, and compact metric shared by the hero, integrations, and
// hosting pills. Depth comes from the hairline alone — no drop shadow.
export const GLOW_PILL_SURFACE_CLASS =
	`${GLOW_PILL_CLASS} inline-flex items-center rounded-full border border-ink/12 bg-paper/45 px-2.5 py-1 text-[13px] text-ink-soft transition-colors hover:border-ink/25 hover:text-ink`;

// Feeds the pointer position (relative to the hovered pill) into the
// --pill-x / --pill-y custom properties the .glow-pill ::after reads. Mirrors
// the changelog pill handler; no rAF needed since it only fires on the small
// hovered element.
export const handleGlowPillMouseMove = (event: MouseEvent<HTMLElement>) => {
	const rect = event.currentTarget.getBoundingClientRect();
	event.currentTarget.style.setProperty('--pill-x', `${event.clientX - rect.left}px`);
	event.currentTarget.style.setProperty('--pill-y', `${event.clientY - rect.top}px`);
};
