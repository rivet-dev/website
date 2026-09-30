import { createClient } from "rivetkit/client";
import type { registry } from "../pi/server";

const client = createClient<typeof registry>("http://localhost:6420");
const agent = client.agent.getOrCreate(["support", "customer-123"]);

const conn = agent.connect();
conn.on("event", (event) => {
	if (event.type === "message_update" && event.assistantMessageEvent.type === "text_delta") {
		process.stdout.write(event.assistantMessageEvent.delta);
	}
	if (event.type === "tool_execution_start") {
		console.log(`\n[${event.toolName}]`);
	}
});

await conn.prompt("Summarize the README.");
await conn.dispose();

const messages = await agent.getMessages();
console.log(`\n${messages.length} messages in the session`);
