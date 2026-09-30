import { pi } from "@rivet-dev/pi";
import { agentOSProvider } from "@rivet-dev/sandbox-adapter/agentos";
import { setup } from "rivetkit";

const agent = pi({
	model: "anthropic/claude-opus-5-5",
	sandbox: agentOSProvider(),
	onCreate: async (c) => {
		await c.cron.set({
			name: "morning-triage",
			expression: "0 9 * * *",
			action: "prompt",
			args: ["Run the test suite and summarize any failures."],
		});
	},
});

export const registry = setup({ use: { agent } });
