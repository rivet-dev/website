import { createClient } from "rivetkit/client";
import type { registry } from "../pi/server";

const client = createClient<typeof registry>();
const conn = client.agent.getOrCreate(["support", "customer-123"]).connect();

conn.on("event", (event) => {
	switch (event.type) {
		case "turn_start":
			console.log("\n[turn]");
			break;
		case "message_update":
			if (event.assistantMessageEvent.type === "text_delta") {
				process.stdout.write(event.assistantMessageEvent.delta);
			}
			break;
		case "tool_execution_start":
			console.log(`\n> ${event.toolName}`);
			break;
		case "tool_execution_end":
			console.log(event.isError ? "  failed" : "  done");
			break;
		case "turn_end":
			if (event.message.role === "assistant") {
				const { totalTokens, cost } = event.message.usage;
				console.log(`\n[${totalTokens} tokens, $${cost.total.toFixed(4)}]`);
			}
			break;
		case "agent_end":
			console.log("\n[done]");
			break;
	}
});

await conn.prompt("Find the failing test and fix it.");
await conn.dispose();
