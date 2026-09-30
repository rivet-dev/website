import { createHmac, timingSafeEqual } from "node:crypto";
import { WebClient } from "@slack/web-api";
import { Hono } from "hono";
import { createClient } from "rivetkit/client";
import type { registry } from "./server";

const signingSecret = process.env.SLACK_SIGNING_SECRET ?? "";
const web = new WebClient(process.env.SLACK_BOT_TOKEN);
const client = createClient<typeof registry>();

export const slack = new Hono();

slack.post("/events", async (c) => {
	const body = await c.req.text();
	const timestamp = c.req.header("x-slack-request-timestamp") ?? "";
	const signature = c.req.header("x-slack-signature") ?? "";
	if (!verifySlackSignature(body, timestamp, signature)) {
		return c.text("invalid signature", 401);
	}

	const payload = JSON.parse(body);

	if (payload.type === "url_verification") {
		return c.json({ challenge: payload.challenge });
	}

	if (c.req.header("x-slack-retry-num")) return c.body(null, 200);

	const event = payload.event;
	if (payload.type === "event_callback" && event?.type === "app_mention") {
		void replyInThread({
			teamId: payload.team_id,
			channel: event.channel,
			threadTs: event.thread_ts ?? event.ts,
			text: event.text,
		}).catch((error) => console.error("slack reply failed", error));
	}
	return c.body(null, 200);
});

async function replyInThread(thread: {
	teamId: string;
	channel: string;
	threadTs: string;
	text: string;
}): Promise<void> {
	const agent = client.agent.getOrCreate([thread.teamId, thread.channel, thread.threadTs]);
	await agent.prompt(thread.text);
	const reply = await agent.getLastAssistantText();
	await web.chat.postMessage({
		channel: thread.channel,
		thread_ts: thread.threadTs,
		text: reply || "I finished without a reply.",
	});
}

function verifySlackSignature(body: string, timestamp: string, signature: string): boolean {
	if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 60 * 5) return false;
	const expected = `v0=${createHmac("sha256", signingSecret).update(`v0:${timestamp}:${body}`).digest("hex")}`;
	return (
		expected.length === signature.length &&
		timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
	);
}
