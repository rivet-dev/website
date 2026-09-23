"use client";

import { useEffect, useRef } from "react";
import { ArgumentSection } from "./ArgumentSection";
import { COLD_START } from "./benchmarks";

/**
 * Two lattices of the same size, each dot lighting as one workload finishes
 * starting. The actor lattice fills in a sweep; the pod lattice is still on its
 * first row when the actor one has cycled. The comparison is the animation
 * rather than a bar chart, so the difference is felt before it is read.
 *
 * Ported from the agentOS cold-start card, which uses the same dot vocabulary.
 */
const DOTS = Array.from({ length: 81 }, (_, index) => index);

/**
 * Both steps are compressed so the lattices are watchable: the fast one sweeps
 * in about two seconds and the slow one is still on its first rows when the
 * fast one has cycled. The labels carry the real gap.
 */
const SLOW_STEP_MS = 420;
const FAST_STEP_MS = 24;
const FAST_CYCLE_MS = 2200;
/**
 * A fast dot is fully lit at 8% of its cycle and back to idle at 34%. A
 * hovered dot fades out over that same window so the two kinds of light
 * cannot be told apart once the pointer moves on.
 */
const FADE_MS = Math.round(FAST_CYCLE_MS * (0.34 - 0.08));
/**
 * How long a dot the pointer merely crossed stays lit before fading. Long
 * enough for the class change to be painted so the fade transition runs.
 */
const TRAIL_HOLD_MS = 80;
const GRID = 9;
const LIT_CLASS = "orch-coldstart-dot--lit";

/**
 * Lights dots under the pointer. The dot directly under a resting pointer
 * stays lit; dots the pointer crosses on its way light up and fade. Pointer
 * events arrive at most once a frame, so a quick flick is traced cell by cell
 * between samples, otherwise a fast move would leave gaps in the trail.
 */
const useHoverLights = (
	field: React.RefObject<HTMLDivElement | null>,
	grids: React.RefObject<HTMLDivElement | null>[],
) => {
	useEffect(() => {
		const root = field.current;
		const lattices = grids
			.map((ref) => ref.current)
			.filter((grid): grid is HTMLDivElement => grid !== null);
		if (!root || lattices.length === 0) return;

		const timers = new Map<HTMLElement, number>();
		const dotAt = (grid: HTMLDivElement, x: number, y: number) => {
			const col = Math.floor(x);
			const row = Math.floor(y);
			if (col < 0 || col >= GRID || row < 0 || row >= GRID) return null;
			return grid.children[row * GRID + col] as HTMLElement | undefined;
		};
		/** Light a dot and keep it lit until released. */
		const hold = (dot: HTMLElement) => {
			const timer = timers.get(dot);
			if (timer !== undefined) {
				window.clearTimeout(timer);
				timers.delete(dot);
			}
			dot.classList.add(LIT_CLASS);
		};
		/** Let a lit dot start fading shortly. */
		const release = (dot: HTMLElement) => {
			if (timers.has(dot)) return;
			timers.set(
				dot,
				window.setTimeout(() => {
					timers.delete(dot);
					dot.classList.remove(LIT_CLASS);
				}, TRAIL_HOLD_MS),
			);
		};

		/** Per lattice: last pointer position in grid units, and the dot held under it. */
		const last: ({ x: number; y: number } | null)[] = lattices.map(() => null);
		const resting: (HTMLElement | null)[] = lattices.map(() => null);

		const moveTo = (index: number, x: number, y: number) => {
			const grid = lattices[index];
			const from = last[index] ?? { x, y };
			const steps = Math.min(
				64,
				Math.max(
					1,
					Math.ceil(Math.max(Math.abs(x - from.x), Math.abs(y - from.y))),
				),
			);
			let under: HTMLElement | null = null;
			for (let step = 1; step <= steps; step++) {
				const t = step / steps;
				const dot = dotAt(
					grid,
					from.x + (x - from.x) * t,
					from.y + (y - from.y) * t,
				);
				if (!dot) continue;
				hold(dot);
				if (step < steps) release(dot);
				else under = dot;
			}
			const previous = resting[index];
			if (previous && previous !== under) release(previous);
			resting[index] = under;
			last[index] = { x, y };
		};

		const leave = () => {
			for (let index = 0; index < lattices.length; index++) {
				const held = resting[index];
				if (held) release(held);
				resting[index] = null;
				last[index] = null;
			}
		};

		const onPointerMove = (event: PointerEvent) => {
			lattices.forEach((grid, index) => {
				const rect = grid.getBoundingClientRect();
				moveTo(
					index,
					((event.clientX - rect.left) / rect.width) * GRID,
					((event.clientY - rect.top) / rect.height) * GRID,
				);
			});
		};
		const onDocumentPointerOut = (event: PointerEvent) => {
			if (event.relatedTarget === null) leave();
		};

		root.addEventListener("pointerenter", onPointerMove);
		root.addEventListener("pointermove", onPointerMove);
		root.addEventListener("pointerleave", leave);
		root.addEventListener("pointercancel", leave);
		document.addEventListener("pointerout", onDocumentPointerOut);
		window.addEventListener("blur", leave);
		return () => {
			root.removeEventListener("pointerenter", onPointerMove);
			root.removeEventListener("pointermove", onPointerMove);
			root.removeEventListener("pointerleave", leave);
			root.removeEventListener("pointercancel", leave);
			document.removeEventListener("pointerout", onDocumentPointerOut);
			window.removeEventListener("blur", leave);
			for (const timer of timers.values()) window.clearTimeout(timer);
			for (const grid of lattices) {
				for (const dot of Array.from(grid.children)) {
					dot.classList.remove(LIT_CLASS);
				}
			}
		};
	}, [field, grids]);
};

export const ColdStartFigure = () => {
	const field = useRef<HTMLDivElement>(null);
	const fastGrid = useRef<HTMLDivElement>(null);
	const slowGrid = useRef<HTMLDivElement>(null);
	const grids = useRef([fastGrid, slowGrid]);
	useHoverLights(field, grids.current);

	return (
		<>
			<style>{`
			.orch-coldstart-dot {
				position: relative;
				width: 6px;
				height: 6px;
				border-radius: 9999px;
				background: rgb(var(--site-ink, 27 25 22) / 0.12);
				animation-iteration-count: infinite;
			}
			/* Hover light. The running animation owns the dot's background, so
			   the pointer paints an overlay instead; it snaps on and fades off
			   over the same window the animation fades a dot. */
			.orch-coldstart-dot::after {
				content: "";
				position: absolute;
				inset: 0;
				border-radius: inherit;
				background: rgb(var(--runtime-highlight, 183 75 35));
				box-shadow: 0 0 7px rgb(var(--runtime-highlight, 183 75 35) / 0.3);
				opacity: 0;
				transition: opacity ${FADE_MS}ms ease-out;
			}
			.orch-coldstart-dot--slow::after {
				background: rgb(var(--site-ink, 27 25 22) / 0.7);
				box-shadow: none;
			}
			.orch-coldstart-dot--lit::after {
				opacity: 1;
				transition-duration: 0ms;
			}
			.orch-coldstart-dot--fast {
				animation-name: orch-coldstart-fast;
				animation-duration: 2200ms;
				animation-timing-function: ease-out;
			}
			.orch-coldstart-dot--slow {
				animation-name: orch-coldstart-slow;
				animation-duration: 34020ms;
				animation-timing-function: steps(1, end);
			}
			@keyframes orch-coldstart-fast {
				0%, 3% { background: rgb(var(--site-ink, 27 25 22) / 0.12); box-shadow: none; transform: scale(0.92); }
				8% { background: rgb(var(--runtime-highlight, 183 75 35)); box-shadow: 0 0 7px rgb(var(--runtime-highlight, 183 75 35) / 0.3); transform: scale(1.22); }
				20% { background: rgb(var(--runtime-highlight, 183 75 35) / 0.4); box-shadow: none; transform: scale(1); }
				34%, 100% { background: rgb(var(--site-ink, 27 25 22) / 0.12); box-shadow: none; transform: scale(0.92); }
			}
			@keyframes orch-coldstart-slow {
				0%, 1.235% { background: rgb(var(--site-ink, 27 25 22) / 0.7); transform: scale(1.18); }
				1.236%, 100% { background: rgb(var(--site-ink, 27 25 22) / 0.12); transform: scale(1); }
			}
			@media (prefers-reduced-motion: reduce) {
				.orch-coldstart-dot { animation: none; }
				.orch-coldstart-dot--fast { background: rgb(var(--runtime-highlight, 183 75 35) / 0.65); }
			}
		`}</style>
			<div
				ref={field}
				className="grid h-52 grid-cols-2 items-center gap-6 touch-pan-y"
			>
				<div>
					<div
						ref={fastGrid}
						className="mx-auto grid w-[5.75rem] grid-cols-9 gap-1"
						aria-hidden="true"
					>
						{DOTS.map((index) => (
							<span
								key={index}
								className="orch-coldstart-dot orch-coldstart-dot--fast"
								style={{ animationDelay: `${index * FAST_STEP_MS}ms` }}
							/>
						))}
					</div>
					<p className="mt-4 text-center text-xs font-medium text-highlight">
						Rivet Actor
						<br />
						{COLD_START.rivetMs} ms
					</p>
				</div>
				<div>
					<div
						ref={slowGrid}
						className="mx-auto grid w-[5.75rem] grid-cols-9 gap-1"
						aria-hidden="true"
					>
						{DOTS.map((index) => (
							<span
								key={index}
								className="orch-coldstart-dot orch-coldstart-dot--slow"
								style={{ animationDelay: `${index * SLOW_STEP_MS}ms` }}
							/>
						))}
					</div>
					<p className="mt-4 text-center text-xs text-ink-faint">
						Kubernetes pod
						<br />
						{COLD_START.kubernetesLabel}
					</p>
				</div>
			</div>
		</>
	);
};

export const ColdStartSection = () => (
	<ArgumentSection
		id="cold-start"
		heading="Start in milliseconds, not minutes."
		lede={
			<>
				A cold start includes scheduling the Actor, loading its state, and
				serving the first request. No image pull, no container boot.
			</>
		}
		stat={{
			value: `${COLD_START.rivetMs} ms`,
			unit: "cold start",
			method: (
				<>
					{COLD_START.method} Uses an{" "}
					<a
						href={COLD_START.experimental.href}
						target="_blank"
						rel="noopener noreferrer"
						className="text-pine underline decoration-pine/40 underline-offset-2 hover:decoration-pine"
					>
						{COLD_START.experimental.label}
					</a>{" "}
					that {COLD_START.experimental.status}.
				</>
			),
		}}
		figure={<ColdStartFigure />}
		figureFirst
	/>
);
