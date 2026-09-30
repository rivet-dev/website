import { ActorError, createClient } from "rivetkit/client";
import type { registry } from "../pi/server";

const client = createClient<typeof registry>(
	process.env.RIVET_ENDPOINT ?? "http://localhost:6420",
);
const agent = client.agent.getOrCreate(["support", "customer-123"]);

// A single request. No connection is opened.
const history = await agent.getMessages();
console.log(`${history.length} messages so far`);

// A live connection receives every event from the session.
const conn = agent.connect();
conn.onStatusChange((status) => console.log(`[connection ${status}]`));

const unsubscribe = conn.on("event", (event) => {
	switch (event.type) {
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
		case "auto_retry_start":
			console.log(`\nRetrying (${event.attempt}/${event.maxAttempts}): ${event.errorMessage}`);
			break;
	}
});

try {
	// Resolves when the run ends, after every tool call and retry.
	await conn.prompt("Summarize the README.");
} catch (error) {
	// The action itself failed, for example a missing credential or a timeout.
	if (error instanceof ActorError) console.error(`\n${error.group}.${error.code}: ${error.message}`);
	else throw error;
}

// A model error does not reject the prompt. It ends the run with an error message.
const last = (await conn.getMessages()).at(-1);
if (last?.role === "assistant" && last.stopReason === "error") {
	console.error(`\nModel error: ${last.errorMessage}`);
}

unsubscribe();
await conn.dispose();
