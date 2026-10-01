import { pi } from "@rivet-dev/pi";

export const agent = pi({
	model: "anthropic/claude-opus-5-5",
	onCreate: async (c) => {
		await c.cron.set({
			name: "morning-triage",
			expression: "0 9 * * *",
			action: "prompt",
			args: ["Summarize yesterday's failed builds."],
		});
	},
});
