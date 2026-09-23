"use client";

import { useEffect, useRef } from "react";
import { ArgumentSection } from "./ArgumentSection";

/**
 * The three durable surfaces an actor owns, named under the claim. Marks ride
 * on the registry's white plate so the vendor colors hold on both themes.
 */
const surfaces = [
	{ label: "SQLite", src: "/images/registry/sqlite3.svg" },
	{ label: "POSIX filesystem", src: "/images/registry/linux.svg" },
	{ label: "S3 tiered storage", src: "/images/registry/s3.svg" },
];

const StorageSurfaces = () => (
	<ul className="flex flex-wrap items-center gap-x-6 gap-y-3">
		{surfaces.map((surface) => (
			<li key={surface.label} className="flex items-center gap-2.5">
				<span className="registry-logo-plate flex size-8 items-center justify-center rounded-lg border border-ink/10 bg-white">
					<img
						src={surface.src}
						alt=""
						aria-hidden="true"
						loading="lazy"
						className="size-[18px] object-contain"
					/>
				</span>
				<span className="text-sm font-medium text-ink-soft">
					{surface.label}
				</span>
			</li>
		))}
	</ul>
);

/**
 * A 6×6 plane of small cylinders in isometric projection, turning slowly in
 * step with the scale cube: one database per actor, all of them at once.
 * Writes fall onto random cylinders as highlight ticks that land, flash the
 * top, and raise the fill level; a full cylinder compacts back down. Hovering
 * a cylinder drops a write onto it; automatic writes pause while hovering.
 *
 * Canvas, for cheap depth sorting. Canvas cannot resolve CSS variables, so
 * the palette is read from the figure's computed style and re-read on theme
 * change: --runtime-highlight (the site accent), and the card's
 * own background, which is `bg-white/55` over paper, so tops occlude the
 * cylinders behind them without a visible tint step.
 */
const PER_SIDE = 6;
const COUNT = PER_SIDE * PER_SIDE;
const TURN_MS = 48_000;
const PITCH = Math.atan(Math.SQRT1_2); // true isometric, ~35.26°
const SPACING = 30;
const RADIUS = 9;
const HEIGHT = 12;
const DROP_MS = 420;
const FLASH_MS = 700;
const FILL_PER_WRITE = 0.12;
/** Pointer hit area grows by this much past the drawn cylinder. */
const HIT_SLACK = 3;
/** A still pointer keeps writing to its cylinder at this rate. */
const HOVER_REPEAT_MS = 360;
/** Path sampling step between pointer events, so fast moves hit every cylinder. */
const HOVER_STEP_PX = 6;

interface Palette {
	highlight: string;
	card: string;
}
const parseRgb = (value: string, fallback: [number, number, number]) => {
	const parts = value.trim().split(/\s+/).map(Number);
	return parts.length === 3 && parts.every(Number.isFinite)
		? (parts as [number, number, number])
		: fallback;
};
const readPalette = (el: HTMLElement): Palette => {
	const style = getComputedStyle(el);
	const paper = parseRgb(
		style.getPropertyValue("--site-paper"),
		[239, 239, 239],
	);
	const surface = parseRgb(
		style.getPropertyValue("--site-surface"),
		[255, 255, 255],
	);
	const card = paper.map((channel, i) =>
		Math.round(channel + (surface[i] - channel) * 0.55),
	);
	return {
		highlight:
			style.getPropertyValue("--runtime-highlight").trim() || "183 75 35",
		card: card.join(" "),
	};
};

/** Deterministic pseudo-random in [0,1) so the opening frame is stable. */
const hash = (n: number) => {
	const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
	return x - Math.floor(x);
};

const DurableStateFigure = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const dpr = window.devicePixelRatio || 1;
		canvas.width = Math.round(width * dpr);
		canvas.height = Math.round(height * dpr);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		let palette = readPalette(canvas);
		const reducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		const cx = width / 2;
		const cy = height / 2 + 6;
		const sinP = Math.sin(PITCH);
		const ry = RADIUS * sinP;

		/** Writes in flight: which cylinder, and when they left. */
		const drops: { index: number; t0: number }[] = [];
		const flashAt = new Array<number>(COUNT).fill(Number.NEGATIVE_INFINITY);
		const fills = Array.from({ length: COUNT }, (_, i) => 0.2 + hash(i) * 0.5);

		type Projected = { x: number; y: number; depth: number };
		/** Last frame's cylinders, front to back, for pointer hit-testing. */
		let frontToBack: { index: number; base: Projected }[] = [];

		const draw = (now: number, yaw: number) => {
			ctx.clearRect(0, 0, width, height);
			const cosY = Math.cos(yaw);
			const sinY = Math.sin(yaw);
			const project = (x: number, z: number) => {
				const rx = x * cosY - z * sinY;
				const rz = x * sinY + z * cosY;
				return { x: cx + rx, y: cy + rz * sinP, depth: rz };
			};
			const items: { index: number; base: ReturnType<typeof project> }[] = [];
			for (let i = 0; i < PER_SIDE; i++) {
				for (let j = 0; j < PER_SIDE; j++) {
					items.push({
						index: i * PER_SIDE + j,
						base: project(
							(i - (PER_SIDE - 1) / 2) * SPACING,
							(j - (PER_SIDE - 1) / 2) * SPACING,
						),
					});
				}
			}
			// Back to front, so nearer cylinders paint over farther ones.
			items.sort((a, b) => a.base.depth - b.base.depth);
			frontToBack = items.slice().reverse();
			const highlight = `rgb(${palette.highlight})`;
			const card = `rgb(${palette.card})`;
			const highlightRgb = parseRgb(palette.highlight, [183, 75, 35]);
			const cardRgb = parseRgb(palette.card, [239, 239, 239]);
			ctx.strokeStyle = highlight;
			ctx.lineWidth = 1;
			for (const { index, base } of items) {
				const topY = base.y - HEIGHT;
				const flash = Math.max(0, 1 - (now - flashAt[index]) / FLASH_MS);
				// Body: a flat-bottomed silhouette, filled with the card color so
				// it occludes what is behind, then the fill level clipped inside.
				ctx.beginPath();
				ctx.moveTo(base.x - RADIUS, topY);
				ctx.lineTo(base.x - RADIUS, base.y);
				ctx.ellipse(base.x, base.y, RADIUS, ry, 0, Math.PI, 0, true);
				ctx.lineTo(base.x + RADIUS, topY);
				ctx.closePath();
				ctx.fillStyle = card;
				ctx.fill();
				const level = (base.y - topY) * fills[index];
				ctx.save();
				ctx.clip();
				ctx.fillStyle = `rgb(${palette.highlight} / 0.28)`;
				ctx.fillRect(
					base.x - RADIUS,
					base.y - level,
					RADIUS * 2,
					level + ry + 1,
				);
				ctx.restore();
				// Outline only the sides and the front of the base. The top edge
				// is drawn by the lid ellipse below; stroking it here would leave
				// a chord across the lid.
				ctx.beginPath();
				ctx.moveTo(base.x - RADIUS, topY);
				ctx.lineTo(base.x - RADIUS, base.y);
				ctx.ellipse(base.x, base.y, RADIUS, ry, 0, Math.PI, 0, true);
				ctx.lineTo(base.x + RADIUS, topY);
				ctx.stroke();
				// Lid: lit while a write is landing. Blend to an opaque color so
				// nothing underneath shows through while it is lit.
				const lit = flash > 0 ? 0.15 + 0.85 * flash : 0;
				const lid = cardRgb.map((channel, i) =>
					Math.round(channel + (highlightRgb[i] - channel) * lit),
				);
				ctx.beginPath();
				ctx.ellipse(base.x, topY, RADIUS, ry, 0, 0, Math.PI * 2);
				ctx.fillStyle = `rgb(${lid[0]} ${lid[1]} ${lid[2]})`;
				ctx.fill();
				ctx.stroke();
			}
			for (const drop of drops) {
				const t = (now - drop.t0) / DROP_MS;
				if (t >= 1) continue;
				const item = items.find((candidate) => candidate.index === drop.index);
				if (!item) continue;
				const y1 = item.base.y - HEIGHT;
				const y0 = y1 - 34;
				ctx.beginPath();
				ctx.arc(item.base.x, y0 + (y1 - y0) * t * t, 2.2, 0, Math.PI * 2);
				ctx.fillStyle = highlight;
				ctx.fill();
			}
		};

		const onTheme = () => {
			palette = readPalette(canvas);
			if (reducedMotion) draw(0, Math.PI / 4);
		};
		window.addEventListener("theme-change", onTheme);

		if (reducedMotion) {
			// A still frame: no turn, no writes.
			draw(0, Math.PI / 4);
			return () => window.removeEventListener("theme-change", onTheme);
		}

		/**
		 * Pointer writes. The cylinder under the pointer takes a drop as soon
		 * as the pointer arrives and again every HOVER_REPEAT_MS while it
		 * lingers. Fast moves are sampled along the segment from the previous
		 * position, so the whole path lights rather than only the endpoints.
		 * Automatic writes pause while the pointer is over the figure, so the
		 * drops on screen are the visitor's.
		 */
		let hovering = false;
		let hoverIndex = -1;
		let hoverDropAt = 0;
		let lastPointer: { x: number; y: number } | null = null;
		const hitTest = (px: number, py: number) => {
			for (const { index, base } of frontToBack) {
				const topY = base.y - HEIGHT;
				const dx = (px - base.x) / (RADIUS + HIT_SLACK);
				const dyLid = (py - topY) / (ry + HIT_SLACK);
				if (dx * dx + dyLid * dyLid <= 1) return index;
				if (
					Math.abs(px - base.x) <= RADIUS + HIT_SLACK &&
					py >= topY &&
					py <= base.y + HIT_SLACK
				) {
					return index;
				}
			}
			return -1;
		};
		const writeAt = (index: number, now: number) => {
			if (index < 0) return;
			if (index === hoverIndex && now - hoverDropAt < HOVER_REPEAT_MS) return;
			if (index !== hoverIndex && drops.some((d) => d.index === index)) {
				hoverIndex = index;
				return;
			}
			hoverIndex = index;
			hoverDropAt = now;
			drops.push({ index, t0: now });
		};
		const onPointerMove = (event: PointerEvent) => {
			const rect = canvas.getBoundingClientRect();
			const scale = width / rect.width;
			const x = (event.clientX - rect.left) * scale;
			const y = (event.clientY - rect.top) * scale;
			const now = performance.now();
			hovering = true;
			if (lastPointer) {
				const dist = Math.hypot(x - lastPointer.x, y - lastPointer.y);
				const steps = Math.min(24, Math.ceil(dist / HOVER_STEP_PX));
				for (let s = 1; s < steps; s++) {
					const t = s / steps;
					writeAt(
						hitTest(
							lastPointer.x + (x - lastPointer.x) * t,
							lastPointer.y + (y - lastPointer.y) * t,
						),
						now,
					);
				}
			}
			writeAt(hitTest(x, y), now);
			lastPointer = { x, y };
		};
		const onPointerLeave = () => {
			hovering = false;
			hoverIndex = -1;
			lastPointer = null;
		};
		canvas.addEventListener("pointermove", onPointerMove);
		canvas.addEventListener("pointerleave", onPointerLeave);

		let frame = 0;
		let nextDrop = 0;
		const start = performance.now();
		const loop = (now: number) => {
			const elapsed = Math.max(0, now - start);
			if (hovering && hoverIndex >= 0) {
				// Linger: keep writing to the cylinder under a still pointer.
				writeAt(hoverIndex, now);
			}
			if (hovering) {
				nextDrop = now + 180;
			} else if (now >= nextDrop) {
				drops.push({ index: Math.floor(Math.random() * COUNT), t0: now });
				nextDrop = now + 180 + Math.random() * 220;
			}
			for (let k = drops.length - 1; k >= 0; k--) {
				const drop = drops[k];
				if (now - drop.t0 < DROP_MS) continue;
				flashAt[drop.index] = now;
				fills[drop.index] = Math.min(1, fills[drop.index] + FILL_PER_WRITE);
				// Full: compacted and tiered out, so it starts filling again.
				if (fills[drop.index] >= 1) fills[drop.index] = 0.15;
				drops.splice(k, 1);
			}
			draw(now, Math.PI / 4 + (elapsed / TURN_MS) * Math.PI * 2);
			frame = requestAnimationFrame(loop);
		};
		frame = requestAnimationFrame(loop);
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener("theme-change", onTheme);
			canvas.removeEventListener("pointermove", onPointerMove);
			canvas.removeEventListener("pointerleave", onPointerLeave);
		};
	}, []);

	return (
		<div className="flex h-52 items-center justify-center">
			<canvas
				ref={canvasRef}
				className="h-52 w-full max-w-[320px]"
				aria-hidden="true"
			/>
		</div>
	);
};

export const DurableStateSection = () => (
	<ArgumentSection
		heading="Durable state for every workload."
		lede={
			<>
				Every Actor gets a SQLite database and a POSIX filesystem, tiered to S3.
				Idle Actors cost nothing, so millions can sit parked with their state
				intact.
			</>
		}
		aside={<StorageSurfaces />}
		links={[
			{
				label: "Storage architecture",
				href: "/docs/deploy/self-host/control-plane/storage/",
			},
		]}
		figure={<DurableStateFigure />}
		srCaption="A plane of thirty-six small databases, one per Actor, with writes landing on them continuously."
	/>
);
