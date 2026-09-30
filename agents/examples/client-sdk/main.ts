import { ActorError } from "rivetkit/client";
import { client } from "./client";
import { printEvent } from "./events";

const agent = client.agent.getOrCreate(["support", "customer-123"]);

const history = await agent.getMessages();
console.log(`${history.length} messages so far`);

const conn = agent.connect();
conn.onStatusChange((status) => console.log(`[connection ${status}]`));
const unsubscribe = conn.on("event", printEvent);

try {
	await conn.prompt("Summarize the README.");
} catch (error) {
	if (!(error instanceof ActorError)) throw error;
	console.error(`\n${error.group}.${error.code}: ${error.message}`);
}

const last = (await conn.getMessages()).at(-1);
if (last?.role === "assistant" && last.stopReason === "error") {
	console.error(`\nModel error: ${last.errorMessage}`);
}

unsubscribe();
await conn.dispose();
