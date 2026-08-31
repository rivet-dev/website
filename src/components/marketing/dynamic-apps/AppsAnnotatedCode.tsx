/**
 * One file, annotated: the generate → deploy → route program shown as a single
 * `server.ts`, with a quiet label gutter marking each region. Renders
 * statically; regions are highlighted at Astro render time.
 */

export interface AnnotatedCodeRegion {
	/** Gutter label. Omit for an unlabeled region such as the import block. */
	label?: string;
	/** One-line note under the label. */
	note?: string;
	/** Highlighted HTML for this region (output of `highlightCodeHtml`). */
	html: string;
}

export interface AppsAnnotatedCodeProps {
	fileName: string;
	regions: AnnotatedCodeRegion[];
	documentationUrl: string;
	sourceUrl: string;
}

const CODE_CLASS =
	'overflow-x-auto font-mono text-[12px] leading-6 text-ink-soft [&_.shiki]:!m-0 [&_.shiki]:!bg-transparent [&_.shiki]:!p-0';

const FOOTER_LINK_CLASS = 'group inline-flex items-center gap-1 font-medium text-ink-soft transition-colors duration-200 hover:text-ink';

const FooterArrow = () => (
	<svg viewBox='0 0 12 12' className='h-3 w-3 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M2 6h8M6.5 2.5L10 6l-3.5 3.5' />
	</svg>
);

export const AppsAnnotatedCode = ({ fileName, regions, documentationUrl, sourceUrl }: AppsAnnotatedCodeProps) => (
	<figure className='overflow-hidden rounded-xl border border-ink/10 bg-white'>
		<div className='flex items-center border-b border-ink/10 px-5 py-3 sm:px-6'>
			<span className='font-mono text-xs text-ink'>{fileName}</span>
		</div>

		<div className='divide-y divide-ink/10'>
			{regions.map((region, index) => (
				<div key={region.label ?? index} className='grid gap-3 px-5 py-5 sm:px-6 md:grid-cols-[minmax(10rem,1fr)_minmax(0,2fr)] md:gap-10 lg:gap-14'>
					<div className='min-w-0 md:pt-0.5'>
						{region.label ? <p className='text-sm font-medium text-ink'>{region.label}</p> : null}
						{region.note ? <p className='mt-0.5 text-xs leading-relaxed text-ink-faint'>{region.note}</p> : null}
					</div>
					<div className={CODE_CLASS}>
						<span
							className='not-prose'
							// biome-ignore lint/security/noDangerouslySetInnerHtml: generated at Astro render time
							dangerouslySetInnerHTML={{ __html: region.html }}
						/>
					</div>
				</div>
			))}
		</div>

		<figcaption className='flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-ink/10 px-5 py-3 text-xs text-ink-faint sm:px-6'>
			<a href={documentationUrl} className={FOOTER_LINK_CLASS}>
				Read the documentation
				<FooterArrow />
			</a>
			<a href={sourceUrl} target='_blank' rel='noreferrer' className={FOOTER_LINK_CLASS}>
				View the full example on GitHub
				<FooterArrow />
			</a>
		</figcaption>
	</figure>
);
