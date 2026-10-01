import { pi } from "@rivet-dev/pi";
import { Hono } from "hono";
import { setup } from "rivetkit";
import { postReply, slack, type SlackThread } from "./slack";

const agent = pi({
	model: "anthropic/claude-opus-5-5",
	actions: {
		receive: async (c, thread: SlackThread) => {
			await c.schedule.after(0, "reply", thread);
		},
		reply: async (c, thread: SlackThread): Promise<void> => {
			const self = c.client<typeof registry>().agent.getForId(c.actorId);
			await self.prompt(thread.text);
			await postReply(thread, await self.getLastAssistantText());
		},
	},
});

export const registry = setup({ use: { agent } });

const app = new Hono();
app.all("/api/rivet/*", (c) => registry.handler(c.req.raw));
app.route("/slack", slack);

export default app;
