import { Type } from "@earendil-works/pi-ai";
import { defineTool } from "@earendil-works/pi-coding-agent";
import { pi } from "@rivet-dev/pi";
import { createClient } from "rivetkit/client";
import type { registry } from "./server";

const requestReview = defineTool({
	name: "request_review",
	label: "Request review",
	description: "Send a finished branch to the repository's reviewer. Don't wait for the review.",
	parameters: Type.Object({ repo: Type.String(), branch: Type.String(), summary: Type.String() }),
	async execute(_toolCallId, { repo, branch, summary }) {
		await client.reviewer.getOrCreate([repo]).requestReview(`Review ${branch}: ${summary}`);
		return { content: [{ type: "text", text: `Sent ${branch} for review.` }], details: undefined };
	},
});

export const coder = pi({ model: "anthropic/claude-opus-5-5", customTools: [requestReview] });

const client = createClient<typeof registry>();
