import type { ReactNode } from 'react';
import { InkPanel } from './editorial/InkPanel';
import { SITE_SECTION_CLASS, SITE_STANDARD_RAIL_CLASS } from './layout';
import { SECTION_H2_BASE_CLASS } from './typography';

// The agentOS closing band: an ink-panel colophon carrying the page's final
// CTAs. Buttons are passed as children using INK_PANEL_LIGHT_BUTTON_CLASS /
// INK_PANEL_GHOST_BUTTON_CLASS — never accent, so the page's single ember
// stays wherever the hero spent it. Hook-free so .astro pages render it with
// no client directive.
interface ClosingCtaPanelProps {
	title: ReactNode;
	description?: ReactNode;
	/** The button row. Pass anchors styled with the ink-panel button constants. */
	children?: ReactNode;
	/** Quiet line under the buttons (e.g. a "Questions? Contact us" aside). */
	footnote?: ReactNode;
	/** Slot into the page's paper / paper-mid section alternation. */
	background?: 'paper' | 'paper-mid';
	/** Oil-painting backdrop for the colophon; omit for the flat ink plate. */
	textureSrc?: string;
	/** Set false to show the texture without the darkening veil. */
	veil?: boolean;
	className?: string;
}

export const ClosingCtaPanel = ({
	title,
	description,
	children,
	footnote,
	textureSrc,
	veil,
	className,
}: ClosingCtaPanelProps) => (
	<section
		className={`bg-paper ${SITE_SECTION_CLASS} ${className ?? ''}`}
	>
		<div className={SITE_STANDARD_RAIL_CLASS}>
			<InkPanel textureSrc={textureSrc} veil={veil}>
				<div className='flex flex-col items-center px-6 py-16 text-center md:py-24'>
					<h2
						className={`max-w-2xl ${SECTION_H2_BASE_CLASS} text-cream ${
							description ? 'mb-3' : 'mb-8'
						}`}
					>
						{title}
					</h2>
					{description ? (
						<p className='mb-8 text-[17px] leading-relaxed text-cream/70'>{description}</p>
					) : null}
					<div className='flex flex-col flex-wrap items-center gap-x-4 gap-y-3 sm:flex-row sm:justify-center'>
						{children}
					</div>
					{footnote ? <p className='mt-8 text-sm text-cream/70'>{footnote}</p> : null}
				</div>
			</InkPanel>
		</div>
	</section>
);
