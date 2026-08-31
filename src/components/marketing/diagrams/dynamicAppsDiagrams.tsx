'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Bot, Braces, Globe, Lock, Route } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { wordmarkMaskStyle } from '@/lib/product-accent';
import { productLogos } from '@/sitemap/productLogos';

// ---------------------------------------------------------------------------
// Three diagrams for the /dynamic-apps chapters. Same vocabulary as the hero
// explainer: white nodes with a hairline ring, one pine highlight for the
// Rivet-owned piece, ink arrows. No shadows, no orange — the page's single
// ember is the hero CTA.
// ---------------------------------------------------------------------------

const CARD_CLASS = 'rounded-xl border border-ink/10 bg-white/55 px-6 py-10 md:px-10 md:py-12';
const NODE_CLASS = 'rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-ink ring-1 ring-ink/10';
const CHIP_CLASS = 'rounded-md bg-paper px-2.5 py-1.5 text-xs text-ink-soft ring-1 ring-ink/[0.08]';
const CHIP_PINE_CLASS = 'rounded-md bg-pine px-2.5 py-1.5 text-xs font-medium text-white';
const SANDBOX_CLASS = 'rounded-lg border border-dashed border-ink/20 p-3';

const INK_FAINT = '#8A8478';
const INK_SOFT = '#56524A';
const INK = '#1B1916';
const PINE = '#2E4034';
// Build verdict colors (repair diagram only).
const FAIL = '#B42318';
const FAIL_FILL = '#FDECEA';
const PASS = '#2E4034';
const PASS_FILL = '#E7ECE7';

// Staged fade-in gated on scroll-into-view; settled instantly under reduced
// motion. `show(n)` fades element n in at ~0.16 s intervals.
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
					transition: { duration: 0.3, delay: 0.1 + order * 0.16, ease: 'easeOut' as const },
				};
	return { ref, inView, reduced, show };
};

// Horizontal on md+, vertical below.
const Arrow = ({ className = '' }: { className?: string }) => (
	<svg
		viewBox='0 0 40 12'
		className={`h-3 w-10 shrink-0 rotate-90 text-ink/30 md:rotate-0 ${className}`}
		fill='none'
		stroke='currentColor'
		strokeWidth='1.25'
		strokeLinecap='round'
		strokeLinejoin='round'
		aria-hidden='true'
	>
		<path d='M1 6h36' />
		<path d='M33 2l4 4-4 4' />
	</svg>
);

// Always vertical; sage so it reads inside ink panels.
const DownArrow = ({ className = '' }: { className?: string }) => (
	<svg viewBox='0 0 12 28' className={`h-7 w-3 shrink-0 ${className}`} fill='none' stroke='currentColor' strokeWidth='1.25' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M6 1v24' />
		<path d='M2 21l4 4 4-4' />
	</svg>
);

// The agentOS product mark inside its ink tile (see Product Marks in CLAUDE.md).
const AgentOSTile = () => (
	<span className='flex size-7 shrink-0 items-center justify-center rounded-[34.375%] bg-ink' aria-hidden='true'>
		<span style={wordmarkMaskStyle(productLogos.agentos.src)} className='block h-full w-full bg-white' />
	</span>
);

const AgentOSLabel = ({ children = 'agentOS' }: { children?: ReactNode }) => (
	<div className='flex items-center gap-2'>
		<AgentOSTile />
		<span className='text-xs font-medium text-ink'>{children}</span>
	</div>
);

// A down arrow with a soft gradient window that sweeps down its stroke when
// `active` becomes true, painting it pine as it passes. The window's rest
// position is off-path, so the pulse ends (and unmounts) invisibly — no jerk
// if the stage advances first. `id` namespaces the SVG defs.
const PulseDownArrow = ({
	className = '',
	active = false,
	duration = 0.21,
	id,
}: {
	className?: string;
	active?: boolean;
	duration?: number;
	id: string;
}) => (
	<svg
		viewBox='0 0 12 28'
		className={`w-3 shrink-0 ${className}`}
		fill='none'
		strokeWidth='1.25'
		strokeLinecap='round'
		strokeLinejoin='round'
		aria-hidden='true'
	>
		<defs>
			<linearGradient id={`${id}-soft`} x1='0' y1='0' x2='0' y2='1'>
				<stop offset='0' stopColor='#fff' stopOpacity='0' />
				<stop offset='0.5' stopColor='#fff' stopOpacity='1' />
				<stop offset='1' stopColor='#fff' stopOpacity='0' />
			</linearGradient>
			<mask id={`${id}-win`}>
				{active && (
					<motion.rect
						x='0'
						width='12'
						height='24'
						fill={`url(#${id}-soft)`}
						initial={{ y: -24 }}
						animate={{ y: 30 }}
						transition={{ duration, ease: 'linear' }}
					/>
				)}
			</mask>
		</defs>
		<path d='M6 1v24' stroke='currentColor' />
		<path d='M2 21l4 4 4-4' stroke='currentColor' />
		<g mask={`url(#${id}-win)`} stroke={PINE} strokeWidth='2.5'>
			<path d='M6 1v24' />
			<path d='M2 21l4 4 4-4' />
		</g>
	</svg>
);

// Cross-section of your backend: the request enters your Node.js backend and
// passes down through your middleware, the apps router, and into the agentOS
// VM running the app. Once in view, a request pulses through on a loop: a pine
// pulse sweeps each arrow, lighting the middleware, then the router, then the
// VM running the target app — cycling through the deployed apps.
type RoutingStage = 'idle' | 'request' | 'toRouter' | 'toVm' | 'vm';

export const AppsRoutingDiagram = () => {
	const { ref, inView, reduced, show } = useDiagram();
	const [stage, setStage] = useState<RoutingStage>('idle');
	const [target, setTarget] = useState(0);
	const clients = [
		{ icon: Globe, label: 'Browser' },
		{ icon: Bot, label: 'Agent' },
		{ icon: Braces, label: 'API' },
	];
	const apps = ['pied-piper', 'hooli', 'aviato', 'initech'];

	useEffect(() => {
		if (!inView || reduced) return;
		let alive = true;
		const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
		(async () => {
			// Let the staged fade-in settle before the first request.
			await sleep(1400);
			let i = 0;
			const step = async (s: RoutingStage, ms: number) => {
				if (!alive) return false;
				setStage(s);
				await sleep(ms);
				return alive;
			};
			while (alive) {
				// Sweep durations are proportional to arrow height (36px top,
				// 16px hops) so the pulse moves at constant speed.
				if (!(await step('request', 280))) return;
				if (!(await step('toRouter', 126))) return;
				if (!(await step('toVm', 126))) return;
				if (!(await step('vm', 770))) return;
				// Advance the target while the GET label is hidden, so it
				// reappears already showing the next app's path.
				i += 1;
				setTarget(i % apps.length);
				if (!(await step('idle', 350))) return;
			}
		})();
		return () => {
			alive = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [inView, reduced]);

	const lit = 'transition-all duration-200';
	const mwLit = stage === 'toRouter' || stage === 'toVm';
	const routerLit = stage === 'toVm';

	return (
		<div
			ref={ref}
			className={CARD_CLASS}
			role='img'
			aria-label='A browser, agent, or API sends GET /apps/pied-piper to your Node.js backend. Inside it, your middleware and auth run first, then the Dynamic Apps router, which hands the request to the agentOS VM running pied-piper alongside the VMs for the other deployed apps.'
		>
			<div className='mx-auto flex max-w-sm flex-col items-center'>
				<motion.div className='flex flex-wrap items-center justify-center gap-2' {...show(0)}>
					{clients.map(({ icon: Icon, label }) => (
						<span key={label} className={`${NODE_CLASS} flex items-center gap-2 whitespace-nowrap px-3 py-2`}>
							<Icon className='size-4 text-ink-soft' strokeWidth={1.75} aria-hidden='true' />
							{label}
						</span>
					))}
				</motion.div>

				<motion.div className='relative my-3 flex items-center justify-center' {...show(1)}>
					<PulseDownArrow id='rt0' className='h-9 text-ink/50' active={stage !== 'idle'} duration={0.42} />
					<span
						className={`absolute left-full top-[45%] ml-3 -translate-y-1/2 whitespace-nowrap font-mono text-xs leading-none ${lit} ${
							stage === 'request' ? 'text-pine opacity-100' : stage === 'idle' ? 'text-ink opacity-100' : 'text-ink opacity-0'
						}`}
					>
						GET /apps/{apps[target]}
					</span>
				</motion.div>

				<motion.div className='w-full max-w-xs rounded-xl bg-white p-4 ring-1 ring-ink/10' {...show(2)}>
					<p className='text-sm font-medium text-ink'>Your Node.js backend</p>

					<div className='mt-2.5 flex flex-col items-center gap-0.5'>
						<motion.div
							className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2.5 text-[13px] ${lit} ${
								mwLit ? 'bg-[#E7ECE7] text-ink ring-1 ring-pine/40' : 'bg-paper text-ink-soft ring-1 ring-ink/[0.08]'
							}`}
							{...show(3)}
						>
							<Lock
								className={`size-4 shrink-0 ${lit} ${mwLit ? 'text-pine' : 'text-ink-faint'}`}
								strokeWidth={1.75}
								aria-hidden='true'
							/>
							Your middleware &amp; auth
						</motion.div>

						<PulseDownArrow id='rt1' className='h-4 text-ink/30' active={stage === 'toRouter' || stage === 'toVm' || stage === 'vm'} />

						<motion.div
							className={`${CHIP_PINE_CLASS} flex w-full items-center gap-2 py-2.5 text-[13px] ${lit} ${
								routerLit ? 'ring-4 ring-pine/25' : 'ring-4 ring-transparent'
							}`}
							{...show(4)}
						>
							<Route className='size-4 shrink-0' strokeWidth={1.75} aria-hidden='true' />
							Dynamic Apps router
						</motion.div>

						<PulseDownArrow id='rt2' className='h-4 text-ink/30' active={stage === 'toVm' || stage === 'vm'} />

						<motion.div className={`${SANDBOX_CLASS} w-full`} {...show(5)}>
							<AgentOSLabel>agentOS VMs</AgentOSLabel>
							<div className='mt-2.5 grid grid-cols-2 gap-1.5'>
								{apps.map((app, i) => {
									const hit = reduced ? i === 0 : stage === 'vm' && i === target;
									return (
										<span
											key={app}
											className={`flex items-center justify-between gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors duration-200 ${
												hit ? 'border-pine bg-white text-ink' : 'border-dashed border-ink/15 bg-ink/[0.03] text-transparent'
											}`}
										>
											<span className='truncate'>{app}</span>
											{hit && (
												<motion.span
													className='shrink-0 font-mono text-[10px] font-medium leading-none text-pine'
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													transition={{ duration: 0.2 }}
												>
													200 OK
												</motion.span>
											)}
										</span>
									);
								})}
							</div>
						</motion.div>
					</div>
				</motion.div>
			</div>
		</div>
	);
};

// Generate → Build → Release, with the repair loop drawn as a single feedback
// arrow: a failed build sends its type errors back to Generate.
//
// Once in view the diagram plays a fixed script: a pine dot travels the path,
// and each attempt either fails (Build turns red, loops back with N type
// errors) or passes (Build turns green, Release bumps the live version). The script is deterministic so a reader watching
// for ten seconds sees it fail once or twice, then ship.
const ATTEMPTS: ReadonlyArray<{ ok: boolean; errors: number }> = [
	{ ok: false, errors: 3 },
	{ ok: false, errors: 1 },
	{ ok: true, errors: 0 },
	{ ok: false, errors: 2 },
	{ ok: true, errors: 0 },
];

type RepairPhase = 'idle' | 'gen' | 'toBuild' | 'build' | 'loop' | 'toRelease' | 'release';

export const AppsRepairDiagram = () => {
	const { ref, inView, reduced, show } = useDiagram();
	const motionRef = useRef<SVGAnimateMotionElement>(null);
	const [phase, setPhase] = useState<RepairPhase>('idle');
	const [errors, setErrors] = useState(0);
	const [version, setVersion] = useState(1);
	const [repaired, setRepaired] = useState(false);

	const NODE_H = 36;
	const NODE_Y = 44;
	const MID_Y = NODE_Y + NODE_H / 2;
	const STATUS_Y = NODE_Y - 12;
	const nodes = [
		{ x: 70, w: 120, label: 'Generate' },
		{ x: 320, w: 120, label: 'Build' },
		{ x: 570, w: 120, label: 'Release' },
	] as const;
	const LOOP_Y = 140; // bottom of the feedback loop

	const genCx = nodes[0].x + nodes[0].w / 2;
	const buildCx = nodes[1].x + nodes[1].w / 2;
	const loopPath = `M ${buildCx} ${NODE_Y + NODE_H} V ${LOOP_Y - 12} Q ${buildCx} ${LOOP_Y} ${buildCx - 12} ${LOOP_Y} H ${genCx + 12} Q ${genCx} ${LOOP_Y} ${genCx} ${LOOP_Y - 12} V ${NODE_Y + NODE_H + 8}`;
	const toBuildPath = `M ${nodes[0].x + nodes[0].w} ${MID_Y} H ${nodes[1].x - 6}`;
	const toReleasePath = `M ${nodes[1].x + nodes[1].w} ${MID_Y} H ${nodes[2].x - 6}`;

	useEffect(() => {
		if (!inView || reduced) return;
		let cancelled = false;
		const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
		const travel = async (path: string, ms: number) => {
			const el = motionRef.current;
			if (!el) return wait(ms);
			el.setAttribute('path', path);
			el.setAttribute('dur', `${ms}ms`);
			el.beginElement();
			await wait(ms);
		};

		(async () => {
			await wait(600);
			let index = 0;
			while (!cancelled) {
				const attempt = ATTEMPTS[index % ATTEMPTS.length];
				setPhase('gen');
				await wait(900);
				if (cancelled) break;
				setPhase('toBuild');
				await travel(toBuildPath, 600);
				if (cancelled) break;
				setPhase('build');
				await wait(1000);
				if (cancelled) break;
				if (attempt.ok) {
					setPhase('toRelease');
					await travel(toReleasePath, 600);
					if (cancelled) break;
					setVersion((v) => v + 1);
					setRepaired(false);
					setPhase('release');
					await wait(1800);
				} else {
					setErrors(attempt.errors);
					setPhase('loop');
					await travel(loopPath, 1100);
					if (cancelled) break;
					setRepaired(true);
					await wait(150);
				}
				index += 1;
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [inView, reduced, loopPath, toBuildPath, toReleasePath]);

	const dotVisible = phase === 'toBuild' || phase === 'toRelease' || phase === 'loop';
	const activeIndex = phase === 'gen' ? 0 : phase === 'build' ? 1 : phase === 'release' ? 2 : -1;
	// Build's verdict colors: red while the errors loop back, green once it passes.
	const buildVerdict: 'fail' | 'pass' | null = phase === 'loop' ? 'fail' : phase === 'toRelease' || phase === 'release' ? 'pass' : null;
	const nodeFill = (index: number) => (index === 1 && buildVerdict === 'fail' ? FAIL_FILL : index === 1 && buildVerdict === 'pass' ? PASS_FILL : '#FFFFFF');
	const nodeStroke = (index: number, active: boolean) =>
		index === 1 && buildVerdict === 'fail' ? FAIL : index === 1 && buildVerdict === 'pass' ? PASS : active ? PINE : INK;
	const nodeStrokeOpacity = (index: number, active: boolean) => ((index === 1 && buildVerdict) || active ? 1 : 0.12);
	const status = (index: number): string | null => {
		if (index === 0 && phase === 'gen') return repaired ? 'repairing' : 'writing files';
		if (index === 1 && phase === 'build') return 'type checking';
		if (index === 1 && phase === 'loop') return `${errors} ${errors === 1 ? 'error' : 'errors'}`;
		if (index === 1 && phase === 'toRelease') return 'passed';
		if (index === 2) return `v${version} live`;
		return null;
	};

	const Forward = ({ from, to }: { from: number; to: number }) => (
		<>
			<line x1={from} y1={MID_Y} x2={to - 6} y2={MID_Y} stroke={INK} strokeOpacity='0.3' strokeWidth='1.25' strokeLinecap='round' />
			<path d={`M ${to - 10} ${MID_Y - 4} L ${to - 5} ${MID_Y} L ${to - 10} ${MID_Y + 4}`} fill='none' stroke={INK} strokeOpacity='0.3' strokeWidth='1.25' strokeLinecap='round' strokeLinejoin='round' />
		</>
	);

	return (
		<div ref={ref} className={`${CARD_CLASS} overflow-x-auto`}>
			<svg
				viewBox='0 0 760 168'
				className='mx-auto block w-full min-w-[34rem] max-w-2xl'
				role='img'
				aria-label='Generate, then build, then release. If the build fails, its type errors feed back into generate and the loop repeats. Each successful build bumps the live version.'
			>
				{nodes.map((node, index) => {
					const isActive = activeIndex === index;
					const label = status(index);
					const emphasized = isActive || (index === 1 && buildVerdict !== null);
					return (
						<motion.g key={node.label} {...show(index)}>
							{index > 0 ? <Forward from={nodes[index - 1].x + nodes[index - 1].w} to={node.x} /> : null}
							<rect
								x={node.x}
								y={NODE_Y}
								width={node.w}
								height={NODE_H}
								rx='9'
								fill={nodeFill(index)}
								stroke={nodeStroke(index, isActive)}
								strokeOpacity={nodeStrokeOpacity(index, isActive)}
								strokeWidth={emphasized ? 1.5 : 1}
								style={{ transition: 'fill 0.25s ease, stroke 0.25s ease, stroke-opacity 0.25s ease, stroke-width 0.25s ease' }}
							/>
							<text x={node.x + node.w / 2} y={MID_Y + 4.5} textAnchor='middle' fontSize='13' fontWeight='500' fill={INK}>
								{node.label}
							</text>
							{label ? (
								<motion.text
									key={label}
									x={node.x + node.w / 2}
									y={STATUS_Y}
									textAnchor='middle'
									fontSize='11'
									fill={index === 1 && buildVerdict === 'fail' ? FAIL : index === 1 && buildVerdict === 'pass' ? PASS : index === 2 ? PINE : INK_SOFT}
									initial={reduced ? { opacity: 1 } : { opacity: 0, y: 3 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.25, ease: 'easeOut' }}
								>
									{label}
								</motion.text>
							) : null}
						</motion.g>
					);
				})}

				{/* Feedback loop: Build → (type errors) → Generate */}
				<motion.g {...show(3)}>
					<path d={loopPath} fill='none' stroke={INK} strokeOpacity='0.3' strokeWidth='1.25' strokeLinecap='round' strokeLinejoin='round' />
					<path d={`M ${genCx - 4} ${NODE_Y + NODE_H + 13} L ${genCx} ${NODE_Y + NODE_H + 7} L ${genCx + 4} ${NODE_Y + NODE_H + 13}`} fill='none' stroke={INK} strokeOpacity='0.3' strokeWidth='1.25' strokeLinecap='round' strokeLinejoin='round' />
					<text x={(genCx + buildCx) / 2} y={LOOP_Y + 17} textAnchor='middle' fontSize='11' fill={INK_FAINT}>
						type errors
					</text>
				</motion.g>

				{/* The travelling request. SMIL motion so the dot follows the curved loop. */}
				{reduced ? null : (
					<circle r='4.5' fill={PINE} style={{ opacity: dotVisible ? 1 : 0, transition: 'opacity 0.2s ease' }} aria-hidden='true'>
						<animateMotion ref={motionRef} begin='indefinite' dur='600ms' fill='freeze' calcMode='linear' />
					</circle>
				)}
			</svg>
		</div>
	);
};

// Nine empty slots inside your Node.js backend. Nothing runs until a request
// lands: then a V8 isolate for that app appears in a free slot, answers (200,
// or now and then a 500), and the slot empties again. A request log on the
// left narrates it, newest line on top: the line appears when the request
// lands and completes when the isolate answers. Fixed seed, so every visitor
// sees the same script.
const ISOLATION_APPS = [
	'pied-piper',
	'hooli',
	'aviato',
	'initech',
	'raviga',
	'nucleus',
	'endframe',
	'sliceline',
	'bachmanity',
	'seefood',
	'optimoji',
	'piperchat',
] as const;
// Official V8 mark in its own colors (public/images/registry/v8.svg). Never tinted.
const V8_LOGO = '/images/registry/v8.svg';
const SLOTS = 9;
const LOG_LINES = 4;
const FAIL_EVERY = 7; // every seventh request answers 500

interface Isolate {
	id: number;
	app: string;
	ok: boolean;
	ms: number;
	done: boolean;
}

export const AppsIsolationDiagram = () => {
	const { ref, inView, reduced, show } = useDiagram();
	const [slots, setSlots] = useState<(Isolate | null)[]>(() =>
		Array.from({ length: SLOTS }, (_, index) =>
			reduced && index === 1
				? { id: 2, app: 'hooli', ok: true, ms: 12, done: false }
				: reduced && index === 6
					? { id: 1, app: 'pied-piper', ok: true, ms: 9, done: true }
					: null,
		),
	);
	const [log, setLog] = useState<Isolate[]>(
		reduced
			? [
					{ id: 2, app: 'hooli', ok: true, ms: 12, done: false },
					{ id: 1, app: 'pied-piper', ok: true, ms: 9, done: true },
				]
			: [],
	);

	useEffect(() => {
		if (!inView || reduced) return;
		let cancelled = false;
		let seed = 0x2f6b4b;
		const rand = () => {
			seed = (seed * 1664525 + 1013904223) >>> 0;
			return seed / 0x100000000;
		};
		const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
		const running = new Array<Isolate | null>(SLOTS).fill(null);
		const publish = () => setSlots([...running]);
		let requests = 0;

		(async () => {
			await wait(500);
			while (!cancelled) {
				const free = running.map((r, index) => (r ? -1 : index)).filter((index) => index >= 0);
				const app = ISOLATION_APPS[Math.floor(rand() * ISOLATION_APPS.length)];
				if (free.length === 0 || running.some((r) => r?.app === app)) {
					await wait(200);
					continue;
				}
				requests += 1;
				const isolate: Isolate = { id: requests, app, ok: requests % FAIL_EVERY !== 0, ms: 6 + Math.floor(rand() * 28), done: false };
				const slot = free[Math.floor(rand() * free.length)];

				// Request lands: log line appears, isolate appears.
				setLog((lines) => [isolate, ...lines].slice(0, LOG_LINES));
				running[slot] = isolate;
				publish();
				await wait(750);
				if (cancelled) break;
				// Isolate answers: the log line completes.
				const done = { ...isolate, done: true };
				setLog((lines) => lines.map((line) => (line.id === isolate.id ? done : line)));
				running[slot] = done;
				publish();
				// The isolate lingers briefly, then the slot empties.
				setTimeout(() => {
					if (cancelled) return;
					if (running[slot]?.id === isolate.id) running[slot] = null;
					publish();
				}, 1300);
				await wait(700);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [inView, reduced]);

	return (
		<div
			ref={ref}
			className={CARD_CLASS}
			role='img'
			aria-label='A request log beside your Node.js backend, which holds nine empty agentOS sandbox slots. Each request appears in the log; a V8 isolate for that app appears in a slot, answers, and the log line completes with its status and latency. Occasionally a request fails with a 500 and only that isolate is affected.'
		>
			<div className='mx-auto flex max-w-3xl flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:gap-5'>
				<motion.div className='shrink-0 font-mono text-xs leading-none sm:w-60' {...show(0)} aria-hidden='true'>
					<div className='flex flex-col gap-2.5'>
						{log.length === 0 ? <span className='text-transparent'>GET /apps/pied-piper</span> : null}
						{log.map((line, index) => (
							<motion.div
								key={line.id}
								layout
								initial={reduced ? false : { opacity: 0, y: -8 }}
								animate={{ opacity: 1 - index * 0.22, y: 0 }}
								transition={{ duration: 0.3, ease: 'easeOut' }}
								className='flex items-center gap-2 whitespace-nowrap'
							>
								<span className='text-ink'>GET /apps/{line.app}</span>
								<span className='text-ink/30'>→</span>
								{line.done ? (
									<>
										<span className={line.ok ? 'text-pine' : 'text-[#B42318]'}>{line.ok ? '200' : '500'}</span>
										<span className='text-ink-faint'>{line.ms}ms</span>
									</>
								) : (
									<span className='text-ink-faint'>…</span>
								)}
							</motion.div>
						))}
					</div>
				</motion.div>

				<motion.div className='min-w-0 flex-1 rounded-xl bg-white p-4 ring-1 ring-ink/10' {...show(1)}>
					<p className='text-sm font-medium text-ink'>Your Node.js backend</p>
					<div className={`${SANDBOX_CLASS} mt-2.5`}>
						<AgentOSLabel>agentOS VMs</AgentOSLabel>
						<div className='mt-2.5 grid grid-cols-3 gap-1.5' aria-hidden='true'>
							{slots.map((isolate, index) => {
								const cls = isolate
									? isolate.ok
										? 'border-pine bg-white text-ink'
										: 'border-[#B42318] bg-[#FDECEA] text-ink'
									: 'border-dashed border-ink/15 bg-ink/[0.03] text-transparent';
								return (
									<div key={index} className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[11px] transition-colors duration-200 ${cls}`}>
										<img src={V8_LOGO} alt='' className={`size-3 shrink-0 object-contain ${isolate ? '' : 'invisible'}`} />
										<span className='truncate'>{isolate?.app ?? '\u00a0'}</span>
									</div>
								);
							})}
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
};
