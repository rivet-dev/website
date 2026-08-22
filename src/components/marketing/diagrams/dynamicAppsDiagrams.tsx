'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';

// ---------------------------------------------------------------------------
// Two abstract diagrams for the /dynamic-apps chapters. Porcelain card, grey
// shapes, one ember moment each. No axes, clocks, or code strings — each
// picture makes one point. Conventions match workflowDiagrams.tsx.
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

// A request crosses your server before Rivet ever sees it. The ember dot is
// the prewarmed VM answering.
export const AppsRoutingDiagram = () => {
	const { ref, show } = useDiagram();

	return (
		<div
			ref={ref}
			className={CARD_CLASS}
			role='img'
			aria-label='A request passes through your Hono server, where your middleware and the apps router run, then the Rivet control plane routes it to a prewarmed agentOS VM serving the generated app'
		>
			<div className='mx-auto flex max-w-2xl flex-col items-center md:flex-row md:items-center md:justify-center'>
				<motion.div className='flex flex-col items-center' {...show(0)}>
					<span className='rounded-lg bg-ink/75 px-4 py-2 text-xs font-medium text-cream'>Request</span>
					<span className='mt-2 whitespace-nowrap text-[11px] text-ink-faint'>agent, browser, or API</span>
				</motion.div>

				<motion.div aria-hidden='true' className='h-6 w-px bg-ink/20 md:h-px md:w-8 md:self-center md:-translate-y-3' {...show(0.5)} />

				<motion.div className='w-full max-w-56 rounded-xl bg-ink/[0.03] p-5 ring-1 ring-ink/10 md:w-auto' {...show(1)}>
					<p className='text-sm font-medium text-ink'>Your Hono server</p>
					<div className='mt-3 flex flex-wrap gap-2'>
						{['your middleware', 'your auth'].map((chip) => (
							<span key={chip} className='rounded-md border border-ink/10 bg-white/55 px-2.5 py-1 text-xs text-ink-soft'>
								{chip}
							</span>
						))}
					</div>
					<span className='mt-3 inline-block rounded-lg bg-ink/75 px-3 py-1.5 text-xs font-medium text-cream'>apps router</span>
				</motion.div>

				<motion.div aria-hidden='true' className='flex flex-col items-center md:flex-row md:self-center md:-translate-y-3' {...show(2)}>
					<span className='h-4 w-px bg-ink/20 md:h-px md:w-5' />
					<span className='whitespace-nowrap rounded-full border border-ink/10 bg-white/55 px-2.5 py-1 text-[11px] text-ink-soft'>control plane</span>
					<span className='h-4 w-px bg-ink/20 md:h-px md:w-5' />
				</motion.div>

				<motion.div className='w-full max-w-56 rounded-xl bg-ink/[0.03] p-5 ring-1 ring-ink/10 md:w-auto' {...show(3)}>
					<p className='flex items-center gap-2 text-sm font-medium text-ink'>
						agentOS VM
						<span className='flex items-center gap-1.5'>
							<span className='size-2 rounded-full bg-accent' />
							<span className='text-[11px] font-medium' style={{ color: EMBER_DEEP }}>prewarmed</span>
						</span>
					</p>
					<motion.div className='mt-3' {...show(4)}>
						<span className='inline-block rounded-lg bg-ink/75 px-3 py-1.5 text-xs font-medium text-cream'>generated app</span>
						<p className='mt-2 text-[11px] text-ink-faint'>serves the response</p>
					</motion.div>
				</motion.div>
			</div>
		</div>
	);
};

// Two lanes and one seam: the deploy lane loops through a failed build and a
// repair; the release lane only changes at the ember tick. A failed build
// never replaces the active release.
export const AppsRepairDiagram = () => {
	const { ref, show } = useDiagram();

	return (
		<div ref={ref} className={CARD_CLASS}>
			<svg
				viewBox='0 0 800 220'
				className='mx-auto block w-full max-w-3xl'
				role='img'
				aria-label='An agent generates files, the first build fails and returns diagnostics, the repaired build succeeds, and only then does a new release replace the previous one, which kept serving throughout'
			>
				{/* Lane captions */}
				<motion.g {...show(0)}>
					<text x='10' y='22' fontSize='11' fill={INK_FAINT}>Deploys</text>
					<text x='10' y='136' fontSize='11' fill={INK_FAINT}>Active release</text>
				</motion.g>

				{/* Generate */}
				<motion.g {...show(0)}>
					<rect x='10' y='40' width='92' height='30' rx='8' fill={INK} fillOpacity='0.78' />
					<text x='56' y='59' textAnchor='middle' fontSize='12' fill={CREAM}>Generate</text>
				</motion.g>

				{/* Failed build, dashed with its diagnostics */}
				<motion.g {...show(1)}>
					<line x1='102' y1='55' x2='142' y2='55' stroke={INK} strokeOpacity='0.2' strokeWidth='1.5' />
					<rect x='142' y='40' width='80' height='30' rx='8' fill='none' stroke='rgba(27,25,22,0.3)' strokeDasharray='4 3' />
					<text x='182' y='59' textAnchor='middle' fontSize='12' fill={INK_SOFT}>Build</text>
					<text x='182' y='90' textAnchor='middle' fontSize='11' fill={INK_FAINT}>diagnostics</text>
				</motion.g>

				{/* Repair, fed by the diagnostics arc */}
				<motion.g {...show(2)}>
					<path d='M 222 62 C 250 92, 282 92, 306 70' fill='none' stroke={INK} strokeOpacity='0.2' strokeWidth='1.5' />
					<rect x='272' y='40' width='84' height='30' rx='8' fill={INK} fillOpacity='0.78' />
					<text x='314' y='59' textAnchor='middle' fontSize='12' fill={CREAM}>Repair</text>
				</motion.g>

				{/* Successful build */}
				<motion.g {...show(3)}>
					<line x1='356' y1='55' x2='396' y2='55' stroke={INK} strokeOpacity='0.2' strokeWidth='1.5' />
					<rect x='396' y='40' width='80' height='30' rx='8' fill={INK} fillOpacity='0.78' />
					<text x='436' y='59' textAnchor='middle' fontSize='12' fill={CREAM}>Build</text>
					<line x1='476' y1='55' x2='518' y2='55' stroke={INK} strokeOpacity='0.2' strokeWidth='1.5' />
				</motion.g>

				{/* The one ember moment: release, and the seam beneath it */}
				<motion.g {...show(4)}>
					<text x='521' y='30' textAnchor='middle' fontSize='12' fontWeight='500' fill={EMBER_DEEP}>Released</text>
					<rect x='520' y='40' width='3' height='138' rx='1.5' fill={EMBER} />
				</motion.g>

				{/* Release lane: the previous release serves the whole time */}
				<motion.g {...show(0)}>
					<rect x='10' y='157' width='506' height='14' rx='7' fill={INK} fillOpacity='0.35' />
					<text x='263' y='192' textAnchor='middle' fontSize='11' fill={INK_SOFT}>previous release keeps serving</text>
				</motion.g>

				<motion.g {...show(4.5)}>
					<rect x='527' y='157' width='263' height='14' rx='7' fill={INK} fillOpacity='0.78' />
					<text x='658' y='192' textAnchor='middle' fontSize='11' fill={INK_SOFT}>new release</text>
				</motion.g>
			</svg>
		</div>
	);
};
