"use client";

import { useEffect, useRef } from "react";
import { ArgumentSection } from "./ArgumentSection";
import { HIBERNATION } from "./benchmarks";

/**
 * A field of actors, each on its own idle/wake cycle.
 *
 * An awake actor is a filled highlight dot. Left alone it cools and shrinks to
 * a faint hibernating dot, and holds there. A request arrives as a ring that
 * expands off the dot, and the dot snaps back to awake in one step — the wake
 * is a cold start, so it is as abrupt as the cold-start figure's lit dot.
 *
 * Left alone, a scheduler wakes each dot once per cycle, offset by a fixed
 * modular permutation so wakes scatter across the grid instead of sweeping;
 * the grid settles to roughly half awake, half hibernating. While the pointer
 * is over the pane the scheduler pauses and requests come only from the
 * pointer, which wakes the dot under it and every cell it crossed since the
 * last event, so a flick leaves a continuous one-dot-wide trail. Woken dots
 * still cool on their own. When the pointer leaves, the ambient schedule
 * resumes.
 *
 * Leaving is detected three ways, because `pointerleave` alone is not
 * reliable: it is skipped when the pointer exits the window in one move, when
 * the window loses focus, and when the page is wheel-scrolled under a resting
 * cursor. So the pane also leaves on window blur, on the pointer leaving the
 * document, and whenever a tick finds the last known pointer position outside
 * the pane's current rect.
 *
 * Timing is JS (a coarse tick); the visuals are CSS — a one-shot wake
 * animation when a dot gains `--awake`, and a transition when it loses it.
 */
const SIDE = 6;
const DOTS = Array.from({ length: SIDE * SIDE }, (_, index) => index);
const CELL_PX = 22;
const CYCLE_MS = 7000;
/** How long an actor stays awake after its last request before it cools. */
const AWAKE_MS = 2500;
const TICK_MS = 80;
/** 7 is coprime with 36, so this visits every offset once, out of grid order. */
const delayFor = (index: number) =>
	Math.round(((index * 7) % DOTS.length) * (CYCLE_MS / DOTS.length));

const AWAKE_CLASS = "orch-hibernate-dot--awake";
/** Dots that open awake; they must not replay the wake ring on first paint. */
const SETTLED_CLASS = "orch-hibernate-dot--settled";

const HibernationFigure = () => {
	const fieldRef = useRef<HTMLDivElement>(null);
	const gridRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const grid = gridRef.current;
		const field = fieldRef.current;
		if (!grid || !field) return;
		const dots = Array.from(grid.children).map(
			(cell) => cell.firstElementChild as HTMLElement,
		);
		const reducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		const start = performance.now();
		// Seed mid-cycle so the grid opens half awake, half hibernating, exactly
		// as the ambient schedule would leave it.
		const lastWake = DOTS.map((index) => start - delayFor(index));
		const nextAutoWake = DOTS.map(
			(index) => start - delayFor(index) + CYCLE_MS,
		);

		const wake = (index: number, now: number) => {
			lastWake[index] = now;
			// Adding the class fresh replays the one-shot wake animation. An
			// awake dot only has its timer extended, so sweeping across the field
			// does not flicker.
			dots[index].classList.add(AWAKE_CLASS);
		};

		let interactive = false;
		/**
		 * Pointer position in grid units (fractional; may be off-grid), while
		 * interactive. Kept fractional so a fast move can be traced cell by cell.
		 */
		let pointer: { x: number; y: number } | null = null;
		/** Where the pointer last was, in viewport pixels, for the tick fallback. */
		let lastClient: { x: number; y: number } | null = null;

		/** A request lands on the one dot whose cell contains (x, y). */
		const wakeAt = (x: number, y: number, now: number) => {
			const col = Math.floor(x);
			const row = Math.floor(y);
			if (col < 0 || col >= SIDE || row < 0 || row >= SIDE) return;
			wake(row * SIDE + col, now);
		};

		/**
		 * Move the pointer to (x, y), waking every cell it crosses on the way.
		 * Pointer events arrive at most once a frame, so a quick flick jumps
		 * several cells between events; sampling the segment at one cell per
		 * step keeps the trail continuous.
		 */
		const moveTo = (x: number, y: number, now: number) => {
			const from = pointer ?? { x, y };
			const steps = Math.min(
				64,
				Math.max(1, Math.ceil(Math.max(Math.abs(x - from.x), Math.abs(y - from.y)))),
			);
			for (let step = 1; step <= steps; step++) {
				const t = step / steps;
				wakeAt(from.x + (x - from.x) * t, from.y + (y - from.y) * t, now);
			}
			pointer = { x, y };
		};

		const leave = () => {
			interactive = false;
			pointer = null;
			lastClient = null;
		};

		const tick = () => {
			const now = performance.now();
			// Fallback leave: the pane moved out from under a resting pointer
			// (wheel scroll) or the leave event never arrived. Compare the last
			// known pointer position with where the pane is now.
			if (interactive && lastClient) {
				const rect = field.getBoundingClientRect();
				if (
					lastClient.x < rect.left ||
					lastClient.x >= rect.right ||
					lastClient.y < rect.top ||
					lastClient.y >= rect.bottom
				) {
					leave();
				}
			}
			// Dots under a resting pointer keep receiving requests, so they stay
			// awake until the pointer moves on.
			if (interactive && pointer) wakeAt(pointer.x, pointer.y, now);
			for (const index of DOTS) {
				if (now >= nextAutoWake[index]) {
					nextAutoWake[index] += CYCLE_MS;
					// Ambient wakes only. Under reduced motion the field is a still
					// frame apart from what the pointer touches.
					if (!interactive && !reducedMotion) wake(index, now);
				}
				if (now - lastWake[index] >= AWAKE_MS) {
					dots[index].classList.remove(AWAKE_CLASS, SETTLED_CLASS);
				}
			}
		};
		tick();
		const timer = window.setInterval(tick, TICK_MS);

		const onPointerMove = (event: PointerEvent) => {
			interactive = true;
			lastClient = { x: event.clientX, y: event.clientY };
			const rect = grid.getBoundingClientRect();
			moveTo(
				(event.clientX - rect.left) / CELL_PX,
				(event.clientY - rect.top) / CELL_PX,
				performance.now(),
			);
		};
		/** The pointer left the document itself (relatedTarget is null then). */
		const onDocumentPointerOut = (event: PointerEvent) => {
			if (event.relatedTarget === null) leave();
		};
		field.addEventListener("pointerenter", onPointerMove);
		field.addEventListener("pointermove", onPointerMove);
		field.addEventListener("pointerleave", leave);
		field.addEventListener("pointercancel", leave);
		document.addEventListener("pointerout", onDocumentPointerOut);
		window.addEventListener("blur", leave);

		return () => {
			window.clearInterval(timer);
			field.removeEventListener("pointerenter", onPointerMove);
			field.removeEventListener("pointermove", onPointerMove);
			field.removeEventListener("pointerleave", leave);
			field.removeEventListener("pointercancel", leave);
			document.removeEventListener("pointerout", onDocumentPointerOut);
			window.removeEventListener("blur", leave);
		};
	}, []);

	return (
		<>
			<style>{`
				.orch-hibernate-dot {
					position: relative;
					width: 10px;
					height: 10px;
					border-radius: 9999px;
					/* hibernating: cooled and unloaded */
					background: rgb(var(--site-ink, 27 25 22) / 0.14);
					transform: scale(0.7);
					/* cooling down is gradual… */
					transition: background 900ms ease-in-out, transform 900ms ease-in-out;
				}
				.orch-hibernate-dot--awake {
					background: rgb(var(--runtime-highlight, 183 75 35));
					transform: scale(1);
					/* …waking is a cold start: one step, with the request ring. */
					transition: none;
				}
				.orch-hibernate-dot--awake:not(.orch-hibernate-dot--settled) {
					animation: orch-hibernate-wake 560ms ease-out;
				}
				@keyframes orch-hibernate-wake {
					/* a request lands: ring leaves the dot… */
					0% { transform: scale(0.7); box-shadow: 0 0 0 0 rgb(var(--runtime-highlight, 183 75 35) / 0.55); }
					/* …and the actor is already awake */
					20% { transform: scale(1.15); box-shadow: 0 0 0 5px rgb(var(--runtime-highlight, 183 75 35) / 0.25); }
					100% { transform: scale(1); box-shadow: 0 0 0 10px rgb(var(--runtime-highlight, 183 75 35) / 0); }
				}
				.orch-hibernate-legend-dot {
					width: 8px;
					height: 8px;
					border-radius: 9999px;
				}
				@media (prefers-reduced-motion: reduce) {
					.orch-hibernate-dot { transition: none; }
					.orch-hibernate-dot--awake { animation: none; }
				}
			`}</style>
			<div ref={fieldRef} className="relative h-52 cursor-default">
				{/* Each dot sits centered in a CELL_PX cell. The pointer's reach is
				    measured from the grid, but it is live over the whole pane so the
				    edge rows are as easy to hit as the middle. */}
				<div
					ref={gridRef}
					className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2"
					style={{ gridTemplateColumns: `repeat(${SIDE}, ${CELL_PX}px)` }}
					aria-hidden="true"
				>
					{DOTS.map((index) => (
						<span
							key={index}
							className="flex size-[22px] items-center justify-center"
						>
							<span
								className={`orch-hibernate-dot${
									delayFor(index) < AWAKE_MS
										? ` ${AWAKE_CLASS} ${SETTLED_CLASS}`
										: ""
								}`}
							/>
						</span>
					))}
				</div>
				<dl
					className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-5 text-xs"
					aria-hidden="true"
				>
					<div className="flex items-center gap-2">
						<dt className="orch-hibernate-legend-dot bg-[rgb(var(--runtime-highlight,183_75_35))]" />
						<dd className="font-medium text-highlight">Awake</dd>
					</div>
					<div className="flex items-center gap-2">
						<dt className="orch-hibernate-legend-dot bg-[rgb(var(--site-ink,27_25_22)/0.14)]" />
						<dd className="text-ink-faint">Hibernating</dd>
					</div>
				</dl>
			</div>
		</>
	);
};

export const HibernationSection = () => (
	<ArgumentSection
		id="hibernation"
		heading="Hibernates when idle, wakes on demand."
		lede={
			<>
				An idle Actor writes its state and unloads. The next request brings
				it back in {HIBERNATION.wakeMs} ms with nothing lost.
			</>
		}
		stat={{ value: HIBERNATION.idleLabel, unit: "while hibernating" }}
		figure={<HibernationFigure />}
		figureFirst
	/>
);
