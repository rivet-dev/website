import { createHmac, timingSafeEqual } from "node:crypto";
import { LinearClient } from "@linear/sdk";
import { Hono } from "hono";
import { createClient } from "rivetkit/client";
import type { registry } from "./server";

const secret = process.env.LINEAR_WEBHOOK_SECRET ?? "";
const trigger = process.env.LINEAR_TRIGGER ?? "@agent";
const linear = new LinearClient({ apiKey: process.env.LINEAR_API_KEY });
const client = createClient<typeof registry>();

export const linearRoutes = new Hono();

// Webhook URL: https://<your-worker>/linear/webhook
linearRoutes.post("/webhook", async (c) => {
	const body = await c.req.text();
	if (!verifyLinearSignature(body, c.req.header("linear-signature") ?? "")) {
		return c.text("invalid signature", 401);
	}

	const payload = JSON.parse(body);
	// Reject deliveries older than a minute to prevent replays.
	if (Math.abs(Date.now() - payload.webhookTimestamp) > 60 * 1000) {
		return c.text("stale webhook", 401);
	}

	if (payload.type === "Comment" && payload.action === "create" && payload.data.body.includes(trigger)) {
		// Reply after acknowledging, because an agent run outlasts the webhook.
		void replyToComment({
			issueId: payload.data.issueId,
			userId: payload.data.userId,
			text: payload.data.body,
		}).catch((error) => console.error("linear reply failed", error));
	}
	return c.body(null, 200);
});

async function replyToComment(comment: {
	issueId: string;
	userId: string;
	text: string;
}): Promise<void> {
	// Never answer the agent's own comments.
	const viewer = await linear.viewer;
	if (comment.userId === viewer.id) return;

	// One agent per Linear issue.
	const agent = client.agent.getOrCreate(["linear", comment.issueId]);
	await agent.prompt(comment.text);
	const reply = await agent.getLastAssistantText();
	await linear.createComment({
		issueId: comment.issueId,
		body: reply || "I finished without a reply.",
	});
}

function verifyLinearSignature(body: string, signature: string): boolean {
	const expected = createHmac("sha256", secret).update(body).digest("hex");
	return (
		expected.length === signature.length &&
		timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
	);
}
