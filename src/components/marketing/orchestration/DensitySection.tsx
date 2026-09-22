"use client";

import { ArgumentSection } from "./ArgumentSection";
import {
	DENSITY,
	DENSITY_MULTIPLE,
} from "./benchmarks";

/**
 * The two squares from the agentOS memory benchmark, relabeled for actors
 * against Kubernetes pods.
 *
 * The squares are drawn to the same 6rem frame so the small one reads as a
 * fraction of the large one rather than as its own shape. The ratio is not to
 * scale — at the real figures the actor square would be a hairline — so the
 * caption carries the number and the drawing carries the impression.
 */
const DensityFigure = () => (
	<div
		className="flex h-52 items-end justify-center gap-12"
		aria-label={`A Rivet actor holds ${DENSITY.rivetLabel}; a Kubernetes pod holds ${DENSITY.kubernetesLabel}`}
	>
		<div className="flex flex-col items-center gap-3">
			<div className="flex h-24 w-24 items-end justify-center">
				<span aria-hidden="true" className="h-3 w-3 bg-pine/75" />
			</div>
			<p className="text-center text-xs font-medium text-pine">
				Rivet actor
				<br />
				{DENSITY.rivetLabel}
			</p>
		</div>
		<div className="flex flex-col items-center gap-3">
			<div
				aria-hidden="true"
				className="h-24 w-24 border border-ink/15 bg-ink/10"
			/>
			<p className="text-center text-xs text-ink-faint">
				Kubernetes pod
				<br />
				{DENSITY.kubernetesLabel}
			</p>
		</div>
	</div>
);

export const DensitySection = () => (
	<ArgumentSection
		id="density"
		heading={`Run ${DENSITY_MULTIPLE}× more workloads per server.`}
		lede={
			<>
				An actor is an addressable unit of state inside a worker process you
				are already running — not a container, not a VM, not a process of its
				own. Nothing to pull, nothing to boot, and no per-pod bookkeeping to
				carry, so a server that held hundreds of workloads holds tens of
				thousands.
			</>
		}
		stat={{
			value: DENSITY.rivetLabel,
			unit: "per running actor",
		}}
		figure={<DensityFigure />}
	/>
);
