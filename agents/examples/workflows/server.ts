import { pi } from "@rivet-dev/pi";
import { agentOSProvider } from "@rivet-dev/sandbox-adapter/agentos";
import { type Registry, setup, workflow } from "@rivet-dev/workflows";

const coreutils = {
	url: "https://unpkg.com/@agentos-software/coreutils@0.3.5/dist/package.aospkg",
	digest: "sha256:a291a48ce90b0ad12d3937e771d9aaec37b289c1f5b047fe3d1d61151dbeee51",
};

const agent = pi({
	model: "anthropic/claude-opus-5-5",
	sandbox: agentOSProvider({ software: [coreutils] }),
});

type Agents = Registry<{ agent: typeof agent }>;

const flakyTest = workflow({
	state: { report: null as string | null },
	run: async (ctx) => {
		await ctx.step({
			name: "first-run",
			timeout: 10 * 60_000,
			run: async (step) => {
				const fixer = step.client<Agents>().agent.getOrCreate([step.actorId]);
				await fixer.abort();
				await fixer.prompt("Run the test suite and note any failing tests.");
			},
		});

		await ctx.sleep("wait-before-rerun", 10 * 60_000);

		await ctx.step({
			name: "second-run",
			timeout: 10 * 60_000,
			run: async (step) => {
				const fixer = step.client<Agents>().agent.getOrCreate([step.actorId]);
				await fixer.abort();
				await fixer.prompt("Run the suite again. Which failures happened both times?");
				step.state.report = (await fixer.getLastAssistantText()) ?? null;
			},
		});
	},
	actions: {
		getReport: (c) => c.state.report,
	},
});

export const registry = setup({ use: { agent, flakyTest } });
