import { Hono } from "hono";
import { createClient } from "rivetkit/client";
import type { registry } from "./server";

const client = createClient<typeof registry>();

export const app = new Hono();

app.post("/prompt", async (c) => {
	const user = await authenticate(c.req.raw);
	if (!user) return c.json({ error: "unauthorized" }, 401);
	const { tenantId, userId } = user;
	const { text } = await c.req.json<{ text: string }>();

	const tenant = client.tenant.getOrCreate([tenantId]);
	const remaining = await tenant.remaining();
	if (remaining <= 0) return c.json({ error: "budget_exceeded" }, 402);

	const agent = client.agent.getOrCreate([tenantId, userId]).connect();
	const before = await agent.getSessionStats();
	let runCost = 0;
	agent.on("event", (event) => {
		if (event.type !== "turn_end" || event.message.role !== "assistant") return;
		runCost += event.message.usage.cost.total;
		if (runCost >= remaining) void agent.abort();
	});

	try {
		await agent.prompt(text);
		return c.json({ reply: await agent.getLastAssistantText() });
	} finally {
		const after = await agent.getSessionStats();
		await tenant.spend(after.cost - before.cost);
		await agent.dispose();
	}
});

async function authenticate(request: Request) {
	const tenantId = request.headers.get("x-tenant-id");
	const userId = request.headers.get("x-user-id");
	return tenantId && userId ? { tenantId, userId } : null;
}
