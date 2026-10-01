import { pi } from "@rivet-dev/pi";
import { Hono } from "hono";
import { setup } from "rivetkit";
import { type DiscordCommand, discord, postReply } from "./discord";

const agent = pi({
	model: "anthropic/claude-opus-5-5",
	actions: {
		receive: async (c, command: DiscordCommand) => {
			await c.schedule.after(0, "reply", command);
		},
		reply: async (c, command: DiscordCommand): Promise<void> => {
			const self = c.client<typeof registry>().agent.getForId(c.actorId);
			await self.prompt(command.prompt);
			await postReply(command, await self.getLastAssistantText());
		},
	},
});

export const registry = setup({ use: { agent } });

const app = new Hono();
app.all("/api/rivet/*", (c) => registry.handler(c.req.raw));
app.route("/discord", discord);

export default app;
