"use client";

import { ArgumentSection } from "./ArgumentSection";
import { SCALE } from "./benchmarks";

/**
 * An endless zoom-out over a lattice of actors.
 *
 * Three identical layers, each a repeating dot lattice painted as a background
 * image rather than as thousands of elements, so there is no cell count and no
 * grid math to get wrong. Each layer scales from 3x down to 1x over the cycle,
 * staggered a third of a cycle apart, and fades in while it is large and out
 * once it has shrunk to the point of becoming fine detail.
 *
 * Because a repeating lattice is infinite inside its element, a layer arriving
 * at 3x is indistinguishable from the one leaving at 1x, so the loop reads as
 * one continuous pull-back rather than as a restarting animation. The radial
 * mask keeps the frame edges from hard-cutting the field.
 */
const ZOOM_FACTOR = 3;
const CYCLE_MS = 9000;
const LAYERS = [0, 1, 2];

const ScaleFigure = () => (
	<>
		<style>{`
			.orch-scale-frame {
				position: relative;
				overflow: hidden;
				-webkit-mask-image: radial-gradient(circle at 50% 50%, #000 48%, transparent 76%);
				mask-image: radial-gradient(circle at 50% 50%, #000 48%, transparent 76%);
			}
			.orch-scale-layer {
				position: absolute;
				inset: 0;
				background-image: radial-gradient(
					circle at center,
					rgba(48, 91, 70, 0.55) 0 1.5px,
					rgba(27, 25, 22, 0.14) 1.5px 2.6px,
					transparent 2.7px
				);
				background-size: 15px 15px;
				background-position: center;
				animation: orch-scale-out ${CYCLE_MS}ms linear infinite;
				will-change: transform, opacity;
			}
			@keyframes orch-scale-out {
				0%   { transform: scale(${ZOOM_FACTOR}); opacity: 0; }
				18%  { opacity: 1; }
				72%  { opacity: 1; }
				100% { transform: scale(1); opacity: 0; }
			}
			.orch-scale-rungs {
				animation: orch-scale-rung ${CYCLE_MS}ms steps(1, end) infinite;
			}
			@keyframes orch-scale-rung {
				0%, 24%   { transform: translateY(0); }
				25%, 49%  { transform: translateY(-25%); }
				50%, 74%  { transform: translateY(-50%); }
				75%, 100% { transform: translateY(-75%); }
			}
			@media (prefers-reduced-motion: reduce) {
				/* One still layer at rest, and the largest rung. */
				.orch-scale-layer { animation: none; opacity: 0; transform: scale(1); }
				.orch-scale-layer[data-layer="0"] { opacity: 1; }
				.orch-scale-rungs { animation: none; transform: translateY(-75%); }
			}
		`}</style>
		<div className="flex h-52 items-center justify-center gap-8">
			<div
				className="orch-scale-frame h-48 w-48 shrink-0 rounded-full"
				aria-hidden="true"
			>
				{LAYERS.map((layer) => (
					<div
						key={layer}
						data-layer={layer}
						className="orch-scale-layer"
						style={{
							animationDelay: `${(-layer * CYCLE_MS) / LAYERS.length}ms`,
						}}
					/>
				))}
			</div>

			{/* The rung readout climbs one step per zoom level, in step with the
			    lattice. A fixed-height window scrolls the list rather than swapping
			    text, so the number never reflows the figure. */}
			<div className="h-8 overflow-hidden" aria-hidden="true">
				<div className="orch-scale-rungs">
					{SCALE.rungs.map((rung) => (
						<div
							key={rung}
							className="flex h-8 items-center text-2xl font-medium tabular-nums text-pine"
						>
							{rung}
						</div>
					))}
				</div>
			</div>
			<span className="sr-only">
				{SCALE.headline} {SCALE.unit} on one control plane.
			</span>
		</div>
	</>
);

export const ScaleSection = () => (
	<ArgumentSection
		id="scale"
		heading="Built for scale."
		lede={
			<>
				Actors are scheduled independently, so capacity is a question of adding
				machines rather than of a cluster ceiling. There is no node count to
				plan around and no sharding scheme to design up front — the same
				control plane that runs a thousand actors runs a billion.
			</>
		}
		stat={{ value: SCALE.headline, unit: SCALE.unit }}
		figure={<ScaleFigure />}
	/>
);
