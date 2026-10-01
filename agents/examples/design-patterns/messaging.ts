import { pi } from "@rivet-dev/pi";
import type { Registry } from "rivetkit";
import { createClient } from "rivetkit/client";

export const reviewer = pi({
	model: "anthropic/claude-opus-5-5",
	actions: {
		requestReview: async (c, request: string) => {
			await c.schedule.after(0, "prompt", request, { streamingBehavior: "followUp" });
		},
	},
});

const client = createClient<Registry<{ reviewer: typeof reviewer }>>();

export async function handOff(repo: string, branch: string) {
	await client.reviewer.getOrCreate([repo]).requestReview(`Review the ${branch} branch.`);
}
