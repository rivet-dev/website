import type { AgentSessionEvent } from "@earendil-works/pi-coding-agent";

export function printEvent(event: AgentSessionEvent) {
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
}
