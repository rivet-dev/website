'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';

// ---------------------------------------------------------------------------
// Three abstract diagrams for the /workflows chapters. Porcelain card, grey
// shapes, hatch for waiting, one ember moment each, purple only on the deploy
// chip. No axes, clocks, or code strings — each picture makes one point.
// ---------------------------------------------------------------------------

const CARD_CLASS =
	'rounded-2xl bg-white/55 p-6 ring-1 ring-ink/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] md:p-8';

const INK = '#1B1916';
const INK_SOFT = '#56524A';
const INK_FAINT = '#8A8478';
const CREAM = '#F4F1E7';
const EMBER = '#CB5A33';
const EMBER_DEEP = '#AB451F';

// Staged fade-in gated on scroll-into-view; settled instantly under reduced
// motion. `show(n)` fades element n in at ~0.18 s intervals.
const useDiagram = () => {
	const ref = useRef<HTMLDivElement>(null);
	const inView = useInView(ref, { once: true, margin: '-15% 0px' });
	const reduced = useReducedMotion();
	const show = (order: number) =>
		reduced
			? { initial: { opacity: 1 }, animate: { opacity: 1 } }
			: {
					initial: { opacity: 0 },
					animate: inView ? { opacity: 1 } : { opacity: 0 },
					transition: { duration: 0.35, delay: 0.15 + order * 0.18, ease: 'easeOut' as const },
				};
	return { ref, show };
};

// One flow, left to right: step → wait → approved → three branches (one
// retries) → step. The whole picture is a single SVG so the fan stays drawn.
export const WorkflowCoordinationDiagram = () => {
	const { ref, show } = useDiagram();

	return (
		<div ref={ref} className={CARD_CLASS}>
			<svg viewBox='0 0 800 220' className='mx-auto block w-full max-w-3xl' role='img' aria-label='A step pauses on a wait, resumes on approval, fans out into three branches where one retries, then joins into a final step'>
				<defs>
					<pattern id='wf-hatch' patternUnits='userSpaceOnUse' width='6' height='6' patternTransform='rotate(135)'>
						<rect width='6' height='6' fill='rgba(27,25,22,0.04)' />
						<rect width='1' height='6' fill='rgba(27,25,22,0.10)' />
					</pattern>
				</defs>

				{/* Step */}
				<motion.g {...show(0)}>
					<rect x='10' y='95' width='84' height='30' rx='8' fill={INK} fillOpacity='0.78' />
					<text x='52' y='114' textAnchor='middle' fontSize='12' fill={CREAM}>Step</text>
				</motion.g>

				{/* Wait */}
				<motion.g {...show(1)}>
					<line x1='94' y1='110' x2='138' y2='110' stroke={INK} strokeOpacity='0.2' strokeWidth='1.5' />
					<rect x='138' y='95' width='140' height='30' rx='15' fill='url(#wf-hatch)' stroke='rgba(27,25,22,0.12)' />
					<text x='208' y='114' textAnchor='middle' fontSize='12' fill={INK_SOFT}>Wait</text>
				</motion.g>

				{/* Approved */}
				<motion.g {...show(2)}>
					<rect x='292' y='92' width='3' height='36' rx='1.5' fill={EMBER} />
					<text x='294' y='80' textAnchor='middle' fontSize='12' fontWeight='500' fill={EMBER_DEEP}>Approved</text>
				</motion.g>

				{/* Fan out */}
				<motion.g {...show(3)}>
					<path d='M 295 110 C 350 110, 360 47, 430 47' fill='none' stroke={INK} strokeOpacity='0.2' strokeWidth='1.5' />
					<path d='M 295 110 L 430 110' fill='none' stroke={INK} strokeOpacity='0.2' strokeWidth='1.5' />
					<path d='M 295 110 C 350 110, 360 173, 430 173' fill='none' stroke={INK} strokeOpacity='0.2' strokeWidth='1.5' />
				</motion.g>

				{/* Branches */}
				<motion.g {...show(4)}>
					<rect x='430' y='40' width='160' height='14' rx='7' fill={INK} fillOpacity='0.78' />
					{/* middle branch: a first try, a gap, then the retry */}
					<rect x='430' y='103' width='62' height='14' rx='7' fill={INK} fillOpacity='0.3' />
					<rect x='506' y='103' width='84' height='14' rx='7' fill={INK} fillOpacity='0.78' />
					<text x='499' y='96' textAnchor='middle' fontSize='11' fill={INK_FAINT}>retry</text>
					<rect x='430' y='166' width='160' height='14' rx='7' fill={INK} fillOpacity='0.78' />
				</motion.g>

				{/* Join */}
				<motion.g {...show(5)}>
					<path d='M 590 47 C 660 47, 650 110, 706 110' fill='none' stroke={INK} strokeOpacity='0.2' strokeWidth='1.5' />
					<path d='M 590 110 L 706 110' fill='none' stroke={INK} strokeOpacity='0.2' strokeWidth='1.5' />
					<path d='M 590 173 C 660 173, 650 110, 706 110' fill='none' stroke={INK} strokeOpacity='0.2' strokeWidth='1.5' />
					<rect x='706' y='95' width='84' height='30' rx='8' fill={INK} fillOpacity='0.78' />
					<text x='748' y='114' textAnchor='middle' fontSize='12' fill={CREAM}>Step</text>
				</motion.g>
			</svg>
		</div>
	);
};

// The agent's computer above a row of recorded steps. The ember square is the
// step running right now.
export const WorkflowAgentDiagram = () => {
	const { ref, show } = useDiagram();

	return (
		<div ref={ref} className={CARD_CLASS}>
			<div className='mx-auto flex max-w-sm flex-col items-center'>
				<motion.div className='w-full rounded-xl bg-ink/[0.03] p-5 text-center ring-1 ring-ink/10' {...show(0)}>
					<p className='text-sm font-medium text-ink'>Agent&rsquo;s computer</p>
					<div className='mt-3 flex flex-wrap justify-center gap-2'>
						{['files', 'shell', 'network'].map((chip) => (
							<span key={chip} className='rounded-md border border-ink/10 bg-white/55 px-2.5 py-1 text-xs text-ink-soft'>
								{chip}
							</span>
						))}
					</div>
				</motion.div>

				<motion.div aria-hidden='true' className='h-6 w-px bg-ink/20' {...show(1)} />

				<div className='flex items-center gap-2.5'>
					{[0, 1, 2, 3].map((i) => (
						<motion.span key={i} className='size-6 rounded-[6px] bg-ink/75' {...show(2 + i * 0.5)} />
					))}
					<motion.span className='size-6 rounded-[6px] bg-accent' {...show(4.5)} />
					<motion.span className='size-6 rounded-[6px] border border-dashed border-ink/30' {...show(5)} />
				</div>
				<motion.p className='mt-3 text-xs font-medium text-ink-faint' {...show(5.5)}>
					Every step recorded
				</motion.p>
			</div>
		</div>
	);
};

// Two runs and one deploy: the older run crosses the deploy line and finishes
// on its version; the newer run starts on the new one.
export const WorkflowVersioningDiagram = () => {
	const { ref, show } = useDiagram();

	const chip = (label: string) => (
		<span className='rounded-full border border-ink/10 bg-ink/[0.04] px-2 py-0.5 font-mono text-[10px] text-ink-soft'>
			{label}
		</span>
	);

	return (
		<div ref={ref} className={CARD_CLASS}>
			<div className='relative py-2'>
				{/* Deploy rule + chip. The rule starts below the chip so it never
				    shows through the translucent pill; it still spans every
				    timeline row the run bars cross. */}
				<motion.div aria-hidden='true' className='pointer-events-none absolute bottom-0 top-8 left-[58%] w-px border-l border-dashed border-product-workflows-hairline' {...show(1)} />
				<motion.div className='relative mb-6 h-6' {...show(1)}>
					<span className='absolute left-[58%] top-0 -translate-x-1/2 whitespace-nowrap rounded-full border border-product-workflows-hairline bg-product-workflows-soft px-2.5 py-0.5 font-mono text-[10px] text-product-workflows'>
						deploy v2
					</span>
				</motion.div>

				<div className='flex flex-col gap-8'>
					<div className='flex items-center gap-4'>
						<span className='w-32 shrink-0 text-right text-xs leading-tight text-ink-soft'>Running before the deploy</span>
						<div className='relative h-6 min-w-0 flex-1'>
							<motion.span className='absolute inset-y-1 left-0 w-[72%] rounded-md bg-ink/75' {...show(0)} />
							<motion.span className='absolute inset-y-1 left-[72%] w-1.5 rounded-full bg-accent' {...show(2)} />
							<motion.span className='absolute top-1/2 -translate-y-1/2' style={{ left: 'calc(72% + 12px)' }} {...show(2)}>
								{chip('v1')}
							</motion.span>
						</div>
					</div>

					<div className='flex items-center gap-4'>
						<span className='w-32 shrink-0 text-right text-xs leading-tight text-ink-soft'>Started after</span>
						<div className='relative h-6 min-w-0 flex-1'>
							<motion.span className='absolute inset-y-1 left-[62%] w-[24%] rounded-md bg-ink/75' {...show(3)} />
							<motion.span className='absolute top-1/2 -translate-y-1/2' style={{ left: 'calc(86% + 12px)' }} {...show(3)}>
								{chip('v2')}
							</motion.span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
