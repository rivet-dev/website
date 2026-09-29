import {
	InteractionResponseType,
	InteractionType,
	verifyKey,
} from "discord-interactions";
import { Hono } from "hono";
import { createClient } from "rivetkit/client";
import type { registry } from "./server";

const publicKey = process.env.DISCORD_PUBLIC_KEY ?? "";
const client = createClient<typeof registry>();

export const discord = new Hono();

// Interactions endpoint URL: https://<your-worker>/discord/interactions
discord.post("/interactions", async (c) => {
	const body = await c.req.text();
	const signature = c.req.header("x-signature-ed25519") ?? "";
	const timestamp = c.req.header("x-signature-timestamp") ?? "";
	if (!(await verifyKey(body, signature, timestamp, publicKey))) {
		return c.text("invalid signature", 401);
	}

	const interaction = JSON.parse(body);

	// Discord pings the endpoint when you save it.
	if (interaction.type === InteractionType.PING) {
		return c.json({ type: InteractionResponseType.PONG });
	}

	if (interaction.type === InteractionType.APPLICATION_COMMAND && interaction.data.name === "ask") {
		const prompt = interaction.data.options?.find(
			(option: { name: string }) => option.name === "prompt",
		)?.value;
		// Discord expects a response within three seconds. Defer, then edit the
		// reply when the agent finishes.
		void answer({
			applicationId: interaction.application_id,
			token: interaction.token,
			channelId: interaction.channel_id ?? interaction.channel?.id,
			prompt: String(prompt ?? ""),
		}).catch((error) => console.error("discord reply failed", error));
		return c.json({ type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE });
	}

	return c.text("unhandled interaction", 400);
});

async function answer(command: {
	applicationId: string;
	token: string;
	channelId: string;
	prompt: string;
}): Promise<void> {
	// One agent per Discord channel.
	const agent = client.agent.getOrCreate(["discord", command.channelId]);
	await agent.prompt(command.prompt);
	const reply = (await agent.getLastAssistantText()) || "I finished without a reply.";
	// Interaction tokens stay valid for 15 minutes. Messages hold up to 2,000 characters.
	await fetch(
		`https://discord.com/api/v10/webhooks/${command.applicationId}/${command.token}/messages/@original`,
		{
			method: "PATCH",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ content: reply.slice(0, 2000) }),
		},
	);
}
