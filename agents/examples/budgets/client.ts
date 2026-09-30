import { createClient } from "rivetkit/client";
import type { registry } from "../pi/server";

const BUDGET_USD = 5;

const client = createClient<typeof registry>("http://localhost:6420");
const conn = client.agent.getOrCreate(["support", "customer-123"]).connect();

conn.on("event", async (event) => {
	if (event.type !== "turn_end") return;
	const { cost } = await conn.getSessionStats();
	if (cost > BUDGET_USD) await conn.abort();
});

const before = await conn.getSessionStats();
if (before.cost < BUDGET_USD) {
	await conn.prompt("Inspect the project and summarize its test failures.");
}

const after = await conn.getSessionStats();
console.log(`This run: ${after.tokens.total - before.tokens.total} tokens`);
console.log(`Session: $${after.cost.toFixed(2)}`);

await conn.dispose();
