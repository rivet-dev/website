"use client";

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

/** Compressed so the slow lattice is watchable; the labels carry the real gap. */
const SLOW_STEP_MS = 420;
const FAST_STEP_MS = COLD_START.rivetMs;

const ColdStartFigure = () => (
	<>
		<style>{`
			.orch-coldstart-dot {
				width: 6px;
				height: 6px;
				border-radius: 9999px;
				background: rgba(27, 25, 22, 0.12);
				animation-iteration-count: infinite;
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
				0%, 3% { background: rgba(27, 25, 22, 0.12); box-shadow: none; transform: scale(0.92); }
				8% { background: #305b46; box-shadow: 0 0 7px rgba(48, 91, 70, 0.3); transform: scale(1.22); }
				20% { background: rgba(48, 91, 70, 0.4); box-shadow: none; transform: scale(1); }
				34%, 100% { background: rgba(27, 25, 22, 0.12); box-shadow: none; transform: scale(0.92); }
			}
			@keyframes orch-coldstart-slow {
				0%, 1.235% { background: rgba(27, 25, 22, 0.7); transform: scale(1.18); }
				1.236%, 100% { background: rgba(27, 25, 22, 0.12); transform: scale(1); }
			}
			@media (prefers-reduced-motion: reduce) {
				.orch-coldstart-dot { animation: none; }
				.orch-coldstart-dot--fast { background: rgba(48, 91, 70, 0.65); }
			}
		`}</style>
		<div className="grid h-52 grid-cols-2 items-center gap-6">
			<div>
				<div
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
				<p className="mt-4 text-center text-xs font-medium text-pine">
					Rivet actor
					<br />
					{COLD_START.rivetMs} ms p50
				</p>
			</div>
			<div>
				<div
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

export const ColdStartSection = () => (
	<ArgumentSection
		id="cold-start"
		heading="Start in milliseconds, not minutes."
		lede={
			<>
				A cold start here is the whole thing: the actor scheduled, its durable
				state loaded, and the first request handled. No image pull, no
				scheduling round trip, no container runtime to wait on. Start a
				workload per request and the user never sees the difference.
			</>
		}
		stat={{
			value: `${COLD_START.rivetMs} ms`,
			unit: "p50",
		}}
		figure={<ColdStartFigure />}
		figureFirst
	/>
);
