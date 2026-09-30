import { Hono } from "hono";
import { createClient } from "rivetkit/client";
import type { registry } from "./server";

const admin = createClient<typeof registry>({
	endpoint: process.env.RIVET_ENDPOINT,
	namespace: process.env.RIVET_NAMESPACE,
	token: process.env.RIVET_ADMIN_TOKEN,
});

async function authenticateUser(request: Request): Promise<string | null> {
	return request.headers.get("x-user-id");
}

const app = new Hono();

app.post("/agent-token", async (c) => {
	const userId = await authenticateUser(c.req.raw);
	if (!userId) return c.json({ error: "unauthorized" }, 401);

	const agent = admin.agent.getOrCreate(["support", userId]);
	const { token } = await agent.issueToken({ subject: userId, expiresIn: 900 });
	return c.json({ agentId: await agent.resolve(), token }, 200, { "Cache-Control": "no-store" });
});

export default app;
