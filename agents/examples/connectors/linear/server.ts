import { pi } from "@rivet-dev/pi";
import { Hono } from "hono";
import { setup } from "rivetkit";
import { type LinearComment, linearRoutes, postReply } from "./linear";

const agent = pi({
	model: "anthropic/claude-opus-5-5",
	actions: {
		receive: async (c, comment: LinearComment) => {
			await c.schedule.after(0, "reply", comment);
		},
		reply: async (c, comment: LinearComment): Promise<void> => {
			const self = c.client<typeof registry>().agent.getForId(c.actorId);
			await self.prompt(comment.text);
			await postReply(comment, await self.getLastAssistantText());
		},
	},
});

export const registry = setup({ use: { agent } });

const app = new Hono();
app.all("/api/rivet/*", (c) => registry.handler(c.req.raw));
app.route("/linear", linearRoutes);

export default app;
