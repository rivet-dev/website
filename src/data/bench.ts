/**
 * Benchmark data for agentOS marketing pages.
 *
 * All costs and multipliers are computed from the raw benchmark inputs below.
 * To update, change the input constants and everything recomputes.
 *
 * Source JSON files — produced by scripts/benchmarks/run-benchmarks.sh into
 * scripts/benchmarks/results/:
 *   coldstart-sleep.json     → COLDSTART_P50/P95/P99_MS  (coldStart.p50, p95, p99)
 *   memory-sleep.json        → MEMORY_SHELL_MB           (result.avgPerVmRssBytes / 1024^2, rounded)
 *   memory-pi-session.json   → MEMORY_AGENT_MB           (result.avgPerVmRssBytes / 1024^2, rounded)
 */

// ── Raw benchmark inputs ──

// Cold start (sleep workload, ms)
export const COLDSTART_P50_MS = 4.8;
export const COLDSTART_P95_MS = 5.6;
export const COLDSTART_P99_MS = 6.1;

// Memory per VM (MB, from avgPerVmRssBytes)
// Copy from scripts/benchmarks/results/
export const MEMORY_AGENT_MB = 131;  // memory-pi-session.json  (137207808 / 1024^2)
export const MEMORY_SHELL_MB = 22;   // memory-sleep.json       (23160422 / 1024^2)

// ── Sandbox baselines (external benchmarks) ──

// Cold start and memory use the same E2B baseline as rivet.dev/docs/benchmarking.

// Cold start baseline: E2B time to first command, 100 sandboxes launched concurrently.
// Source: https://www.computesdk.com/benchmarks/sandboxes/burst-tti (October 30, 2026 run)
export const SANDBOX_COLDSTART_PROVIDER = 'E2B';
export const SANDBOX_COLDSTART_SOURCE = "ComputeSDK's October 30, 2026 sandbox benchmark";
export const SANDBOX_COLDSTART_MS = { p50: 1270, p95: 1470, p99: 1700 };

// Memory baseline: E2B's default allocation per sandbox, not measured use.
// Source: https://docs.e2b.dev/billing (as of November 4, 2026)
export const SANDBOX_MEMORY_PROVIDER = 'E2B';
export const SANDBOX_MEMORY_SOURCE = "E2B's billing documentation, as of November 4, 2026";
export const SANDBOX_MEMORY_MB = 512;

// Cost baseline: E2B's default sandbox (2 vCPU, SANDBOX_MEMORY_MB of RAM) at its
// per-second list prices: $0.000014 per vCPU and $0.0000045 per GiB of RAM.
// Source: https://e2b.dev/pricing (as of November 4, 2026)
export const SANDBOX_COST_PROVIDER = 'E2B';
export const SANDBOX_COST_SOURCE = "E2B's pricing page, as of November 4, 2026";
export const SANDBOX_VCPU_COST_PER_SEC = 0.000014;
export const SANDBOX_GIB_COST_PER_SEC = 0.0000045;
export const SANDBOX_VCPU = 2;

// ── Self-hosted hardware pricing ──

export const HARDWARE = [
	{ label: 'Hetzner ARM', costPerHour: 3.29 * 1.09 / (30 * 24),    memoryMb: 4096 }, // €3.29/mo
	{ label: 'Hetzner x86', costPerHour: 5.39 * 1.09 / (30 * 24),    memoryMb: 4096 }, // €5.39/mo
	{ label: 'AWS ARM',     costPerHour: 0.0084,                      memoryMb: 1024 },
	{ label: 'AWS x86',     costPerHour: 0.0104,                      memoryMb: 1024 },
] as const;

export const UTILIZATION = 0.7;

// ── Computed data ──

export const sandboxCostPerSec =
	SANDBOX_VCPU * SANDBOX_VCPU_COST_PER_SEC +
	(SANDBOX_MEMORY_MB / 1024) * SANDBOX_GIB_COST_PER_SEC;

function formatCost(perSec: number): string {
	const magnitude = Math.floor(Math.log10(Math.abs(perSec)));
	const decimals = Math.max(0, -magnitude + 1);
	return `$${perSec.toFixed(decimals)}/s`;
}

export interface CostTier {
	label: string;
	value: string;
	multiplier: string;
	ratio: number;
	bar: number;
	/** Concurrent executions packed onto one server at UTILIZATION (the cost denominator). */
	execs: number;
	/** Server RAM in MB for this hardware tier. */
	serverMemMb: number;
	/** Per-execution memory footprint in MB (the workload's memoryMb). */
	workloadMemMb: number;
	/** Raw server price per hour, for "$X/hr server / N execs" copy. */
	costPerHour: number;
}

export interface MemoryData {
	agentOS: string;
	agentOSBar: number;
	sandbox: string;
	sandboxBar: number;
	multiplier: string;
}

export interface WorkloadData {
	label: string;
	description: string;
	memory: MemoryData;
	cost: CostTier[];
	sandboxCost: string;
}

export function computeWorkload(label: string, description: string, memoryMb: number): WorkloadData {
	const memBar = Math.round((memoryMb / SANDBOX_MEMORY_MB) * 1000) / 10;
	const memMultiplier = Math.round(SANDBOX_MEMORY_MB / memoryMb);

	const cost: CostTier[] = HARDWARE.map((hw) => {
		const instanceCostPerSec = hw.costPerHour / 3600;
		const effectiveExecs = Math.floor(Math.floor(hw.memoryMb / memoryMb) * UTILIZATION);
		const costPerExecSec = instanceCostPerSec / effectiveExecs;
		const ratio = sandboxCostPerSec / costPerExecSec;
		const bar = Math.round((costPerExecSec / sandboxCostPerSec) * 1000) / 10;
		return {
			label: hw.label,
			value: formatCost(costPerExecSec),
			multiplier: `${Math.round(ratio)}x cheaper`,
			ratio: Math.round(ratio),
			bar,
			execs: effectiveExecs,
			serverMemMb: hw.memoryMb,
			workloadMemMb: memoryMb,
			costPerHour: hw.costPerHour,
		};
	});

	return {
		label,
		description,
		memory: {
			agentOS: `~${memoryMb} MB`,
			agentOSBar: memBar,
			sandbox: `${SANDBOX_MEMORY_MB} MiB`,
			sandboxBar: 100,
			multiplier: `${memMultiplier}x smaller`,
		},
		cost,
		sandboxCost: formatCost(sandboxCostPerSec),
	};
}

// Pre-computed workloads
export const benchColdStart = [
	{ label: 'p50' as const, agentOS: COLDSTART_P50_MS, sandbox: SANDBOX_COLDSTART_MS.p50 },
	{ label: 'p95' as const, agentOS: COLDSTART_P95_MS, sandbox: SANDBOX_COLDSTART_MS.p95 },
	{ label: 'p99' as const, agentOS: COLDSTART_P99_MS, sandbox: SANDBOX_COLDSTART_MS.p99 },
];

export const benchWorkloads = {
	agent: computeWorkload(
		'Coding agent',
		'Pi coding agent session with MCP servers and mounted file systems',
		MEMORY_AGENT_MB,
	),
	shell: computeWorkload(
		'Execution',
		'Minimal shell workload running simple commands',
		MEMORY_SHELL_MB,
	),
};

export type WorkloadKey = keyof typeof benchWorkloads;
