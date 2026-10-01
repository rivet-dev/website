import { pi } from "@rivet-dev/pi";
import { type Registry, workflow } from "@rivet-dev/workflows";

export const agent = pi({ model: "anthropic/claude-opus-5-5" });

type Agents = Registry<{ agent: typeof agent }>;

export const triage = workflow({
	run: async (ctx) => {
		await ctx.step({
			name: "triage",
			timeout: 10 * 60_000,
			run: async (step) => {
				const triager = step.client<Agents>().agent.getOrCreate([step.actorId]);
				await triager.abort();
				await triager.prompt("Triage yesterday's failed builds.");
			},
		});
	},
});
