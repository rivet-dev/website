import type { ReactNode } from 'react';

/**
 * Hero explainer for Dynamic Apps: generate → deploy → route, one picture per
 * step. Renders statically; hover motion is CSS-only (group-hover) and skipped
 * under prefers-reduced-motion. The deploy snippet is highlighted at Astro
 * render time with the same highlighter as the code tabs below the hero.
 *
 * No container card: the white pieces sit directly on the paper field so the
 * hero motif flows around them and the contrast comes from white-on-paper. Hovering a step only moves its pieces — nothing dims or tints.
 */

const APP_ID = 'pied-piper';
const APP_HOST = 'acme.dev';

export const DEPLOY_CODE = `await deployApp({
  appId: "${APP_ID}",
  files,
});`;

// Shared rest → hover surface for every piece inside a step.
const PIECE_CLASS =
	'rounded-lg bg-white ring-1 ring-ink/10 transition-transform duration-300 motion-reduce:transition-none';
const CODE_CHIP_CLASS = `${PIECE_CLASS} px-3.5 py-2.5 font-mono text-[11px] leading-[1.6] text-ink-soft`;

const Step = ({ title, note, children }: { title: string; note: string; children: ReactNode }) => (
	<div className='group flex min-w-0 flex-col items-center'>
		<div className='flex h-44 w-full items-center justify-center'>{children}</div>
		<p className='mt-5 text-sm font-medium text-ink'>{title}</p>
		<p className='mt-0.5 text-xs text-ink-faint'>{note}</p>
	</div>
);

const Arrow = () => (
	<div className='flex items-center justify-center md:h-44' aria-hidden='true'>
		<svg viewBox='0 0 40 12' className='h-3 w-10 rotate-90 text-ink/30 md:rotate-0' fill='none' stroke='currentColor' strokeWidth='1.25' strokeLinecap='round' strokeLinejoin='round'>
			<path d='M1 6h36' />
			<path d='M33 2l4 4-4 4' />
		</svg>
	</div>
);

const ReactMark = () => (
	<svg viewBox='-11.5 -10.5 23 21' className='h-3.5 w-3.5' aria-hidden='true'>
		<circle r='2' fill='#149eca' />
		<g stroke='#149eca' strokeWidth='1' fill='none'>
			<ellipse rx='10' ry='4.5' />
			<ellipse rx='10' ry='4.5' transform='rotate(60)' />
			<ellipse rx='10' ry='4.5' transform='rotate(120)' />
		</g>
	</svg>
);

const FILE_ICONS: Record<string, ReactNode> = {
	'App.tsx': (
		<span className='flex h-5 w-5 items-center justify-center rounded bg-[#eaf8fc]'>
			<ReactMark />
		</span>
	),
	'api.ts': <span className='flex h-5 w-5 items-end justify-end rounded bg-[#3178c6] p-0.5 text-[7px] font-bold leading-none text-white'>TS</span>,
	'server.js': (
		<span className='flex h-5 w-5 items-center justify-center rounded bg-[#eef7ed]'>
			<img src='/images/registry/nodejs.svg' alt='' aria-hidden='true' className='h-3.5 w-3.5 object-contain' />
		</span>
	),
};

const FileCard = ({ name, lines, className, caret, iconOnly }: { name: string; lines: readonly string[]; className: string; caret?: boolean; iconOnly?: boolean }) => (
	<div className={`${PIECE_CLASS} absolute h-24 p-2 ${className}`}>
		<div className='flex items-center gap-1.5'>
			{FILE_ICONS[name]}
			{iconOnly ? null : <span className='font-mono text-[10px] text-ink'>{name}</span>}
		</div>
		<div className='mt-3 space-y-1.5'>
			{lines.map((width, index) => (
				<div key={width} className='flex items-center gap-1'>
					<div className={`h-1 rounded-full ${width} ${index === 0 ? 'bg-ink/15' : 'bg-ink/[0.08]'}`} />
					{caret && index === lines.length - 1 ? <span className='h-2 w-px bg-ink/60 motion-safe:animate-pulse' /> : null}
				</div>
			))}
		</div>
	</div>
);

// On hover the stack fans out: back cards tilt further and slide outward, the
// front card lifts.
const GenerateStep = () => (
	<div className='relative h-40 w-full max-w-[10.5rem]'>
		<FileCard name='server.js' lines={['w-4/5', 'w-3/5']} iconOnly className='top-1 right-6 left-0 z-10 -rotate-6 motion-safe:group-hover:-translate-x-1.5 motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:-rotate-[9deg]' />
		<FileCard name='api.ts' lines={['w-3/4', 'w-1/2']} iconOnly className='top-5 right-0 left-6 z-20 rotate-6 motion-safe:group-hover:translate-x-1.5 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:rotate-[9deg]' />
		<FileCard name='App.tsx' lines={['w-5/6', 'w-2/3', 'w-3/4']} className='top-10 right-3 left-3 z-30 motion-safe:group-hover:-translate-y-1' caret />
	</div>
);

const DeployStep = ({ deployCodeHtml }: { deployCodeHtml: string }) => (
	<div className={`${CODE_CHIP_CLASS} motion-safe:group-hover:-translate-y-1 [&_.shiki]:!m-0 [&_.shiki]:!bg-transparent [&_.shiki]:!p-0`}>
		<span
			className='not-prose'
			// biome-ignore lint/security/noDangerouslySetInnerHtml: generated at Astro render time from DEPLOY_CODE
			dangerouslySetInnerHTML={{ __html: deployCodeHtml }}
		/>
	</div>
);

const RouteStep = () => (
	<div className='w-full max-w-[12.5rem]'>
		<div className={`flex items-center gap-2 ${CODE_CHIP_CLASS} py-2 motion-safe:group-hover:-translate-y-0.5`}>
			<span className='whitespace-nowrap'>
				<span className='text-ink-faint'>GET</span> <span className='text-ink'>/apps/{APP_ID}</span>
			</span>
			<span className='ml-auto rounded-full bg-pine px-1.5 py-0.5 text-[10px] font-medium leading-none text-white transition-transform duration-300 motion-safe:group-hover:scale-110'>200</span>
		</div>
		<div className={`${PIECE_CLASS} mt-2 overflow-hidden motion-safe:group-hover:-translate-y-1`}>
			<div className='flex items-center gap-1.5 border-b border-ink/[0.08] px-2 py-1.5'>
				<span className='flex shrink-0 gap-1' aria-hidden='true'>
					<span className='h-1.5 w-1.5 rounded-full bg-ink/15' />
					<span className='h-1.5 w-1.5 rounded-full bg-ink/15' />
					<span className='h-1.5 w-1.5 rounded-full bg-ink/15' />
				</span>
				<span className='min-w-0 flex-1 truncate rounded bg-ink/[0.04] px-1.5 py-0.5 font-mono text-[9px] text-ink-faint ring-1 ring-ink/[0.06]'>
					{APP_HOST}/apps/{APP_ID}
				</span>
			</div>
			<div className='space-y-2 p-2.5'>
				<div className='flex items-center justify-between'>
					<div className='h-1.5 w-1/3 rounded-full bg-ink/15' />
					<div className='h-3 w-8 rounded bg-pine' />
				</div>
				<div className='grid grid-cols-2 gap-1.5'>
					{[0, 1].map((card) => (
						<div key={card} className='rounded bg-ink/[0.04] p-1.5 ring-1 ring-ink/[0.06]'>
							<div className='h-1 w-1/2 rounded-full bg-ink/15' />
							<div className='mt-1.5 h-1 w-full rounded-full bg-ink/[0.08]' />
							<div className='mt-1 h-1 w-3/4 rounded-full bg-ink/[0.08]' />
						</div>
					))}
				</div>
				<div className='h-1 w-5/6 rounded-full bg-ink/[0.08]' />
			</div>
		</div>
	</div>
);

export const AppsVisualization = ({ deployCodeHtml }: { deployCodeHtml: string }) => (
	<figure className='px-2 py-4 sm:px-6'>
		<div className='grid gap-6 md:grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1fr)_2.5rem_minmax(0,1fr)] md:items-start'>
			<Step title='Generate' note='An LLM writes the files'>
				<GenerateStep />
			</Step>
			<Arrow />
			<Step title='Deploy' note='One call from your code'>
				<DeployStep deployCodeHtml={deployCodeHtml} />
			</Step>
			<Arrow />
			<Step title='Route' note='Live on your domain'>
				<RouteStep />
			</Step>
		</div>
		<figcaption className='sr-only'>
			An LLM generates App.tsx, api.ts, and server.js. Your code calls deployApp with those files. A GET request to {APP_HOST}/apps/{APP_ID} returns 200 and the page opens in the browser.
		</figcaption>
	</figure>
);
