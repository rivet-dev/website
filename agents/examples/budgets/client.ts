import { createClient } from "rivetkit/client";
import type { registry } from "../pi/server";

const SESSION_BUDGET_USD = 20;
const RUN_BUDGET_USD = 2;

const client = createClient<typeof registry>(
	process.env.RIVET_ENDPOINT ?? "http://localhost:6420",
);

async function promptWithBudget(key: string[], text: string) {
	const conn = client.agent.getOrCreate(key).connect();
	try {
		const session = await conn.getSessionStats();
		if (session.cost >= SESSION_BUDGET_USD) {
			throw new Error(`Session budget reached: $${session.cost.toFixed(2)}`);
		}

		let runCost = 0;
		conn.on("event", (event) => {
			if (event.type !== "turn_end" || event.message.role !== "assistant") return;
			runCost += event.message.usage.cost.total;
			if (runCost > RUN_BUDGET_USD || session.cost + runCost > SESSION_BUDGET_USD) {
				void conn.abort();
			}
		});

		await conn.prompt(text);
		return runCost;
	} finally {
		await conn.dispose();
	}
}

const cost = await promptWithBudget(["support", "customer-123"], "Fix the failing tests.");
console.log(`This run cost $${cost.toFixed(4)}`);
