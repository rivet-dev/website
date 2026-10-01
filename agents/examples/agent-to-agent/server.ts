import { pi } from "@rivet-dev/pi";
import { setup } from "rivetkit";
import { coder } from "./coder";

const reviewer = pi({
	model: "anthropic/claude-opus-5-5",
	actions: {
		requestReview: async (c, request: string) => {
			await c.schedule.after(0, "prompt", request, { streamingBehavior: "followUp" });
		},
	},
});

export const registry = setup({ use: { coder, reviewer } });
