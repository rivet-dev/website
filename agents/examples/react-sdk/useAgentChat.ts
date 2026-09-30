import type { AssistantMessage, ToolResultMessage, UserMessage } from "@earendil-works/pi-ai";
import { createRivetKit } from "@rivetkit/react";
import { useEffect, useState } from "react";
import type { registry } from "../pi/server";

const { useActor } = createRivetKit<typeof registry>("http://localhost:6420");

export type ChatItem =
	| { kind: "message"; id: string; role: "user" | "assistant"; text: string }
	| { kind: "tool"; id: string; name: string; status: "running" | "done" | "failed" };

export function useAgentChat(key: string[]) {
	const agent = useActor({ name: "agent", key });
	const [items, setItems] = useState<ChatItem[]>([]);
	const [streaming, setStreaming] = useState("");
	const [running, setRunning] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		agent.connection?.getMessages().then((history) => setItems(fromHistory(history)));
	}, [agent.connection]);

	agent.useEvent("event", (event) => {
		switch (event.type) {
			case "agent_start":
				setRunning(true);
				setError(null);
				break;
			case "agent_settled":
				setRunning(false);
				break;
			case "message_update":
				if (event.assistantMessageEvent.type === "text_delta") {
					const { delta } = event.assistantMessageEvent;
					setStreaming((text) => text + delta);
				}
				break;
			case "message_end": {
				const { message } = event;
				setStreaming("");
				const item = toMessageItem(message);
				if (item) setItems((current) => [...current, item]);
				if (isAssistant(message) && message.stopReason === "error") {
					setError(message.errorMessage ?? "The model returned an error.");
				}
				break;
			}
			case "tool_execution_start": {
				const tool: ChatItem = {
					kind: "tool",
					id: event.toolCallId,
					name: event.toolName,
					status: "running",
				};
				setItems((current) => [...current, tool]);
				break;
			}
			case "tool_execution_end": {
				const status = event.isError ? "failed" : "done";
				setItems((current) =>
					current.map((item) =>
						item.kind === "tool" && item.id === event.toolCallId ? { ...item, status } : item,
					),
				);
				break;
			}
		}
	});

	async function send(text: string) {
		if (!agent.connection) return;
		try {
			if (running) await agent.connection.steer(text);
			else await agent.connection.prompt(text);
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
		}
	}

	function stop() {
		void agent.connection?.abort();
	}

	return {
		items,
		streaming,
		running,
		error,
		connStatus: agent.connStatus,
		ready: agent.connection !== null,
		send,
		stop,
	};
}

function fromHistory(history: { role: string }[]): ChatItem[] {
	const failed = new Set(
		history.filter(isToolResult).filter((result) => result.isError).map((result) => result.toolCallId),
	);
	return history.flatMap((message) => {
		const items: ChatItem[] = [];
		const item = toMessageItem(message);
		if (item) items.push(item);
		if (isAssistant(message)) {
			for (const part of message.content) {
				if (part.type !== "toolCall") continue;
				items.push({
					kind: "tool",
					id: part.id,
					name: part.name,
					status: failed.has(part.id) ? "failed" : "done",
				});
			}
		}
		return items;
	});
}

function toMessageItem(message: { role: string }): ChatItem | null {
	if (!isUser(message) && !isAssistant(message)) return null;
	const text =
		typeof message.content === "string"
			? message.content
			: message.content.flatMap((part) => (part.type === "text" ? [part.text] : [])).join("");
	if (!text) return null;
	return { kind: "message", id: crypto.randomUUID(), role: message.role, text };
}

function isUser(message: { role: string }): message is UserMessage {
	return message.role === "user";
}

function isAssistant(message: { role: string }): message is AssistantMessage {
	return message.role === "assistant";
}

function isToolResult(message: { role: string }): message is ToolResultMessage {
	return message.role === "toolResult";
}
