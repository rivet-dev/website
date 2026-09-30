import type { AssistantMessage, UserMessage } from "@earendil-works/pi-ai";
import { createRivetKit } from "@rivetkit/react";
import { type FormEvent, useEffect, useState } from "react";
import type { registry } from "../pi/server";

const { useActor } = createRivetKit<typeof registry>("http://localhost:6420");

type ChatMessage = UserMessage | AssistantMessage;

export function Chat({ userId }: { userId: string }) {
	const agent = useActor({ name: "agent", key: ["support", userId] });
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [streaming, setStreaming] = useState("");
	const [tool, setTool] = useState<string | null>(null);
	const [running, setRunning] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [input, setInput] = useState("");

	// Load the conversation once the connection is open.
	useEffect(() => {
		agent.connection?.getMessages().then((history) => {
			setMessages(history.filter(isChatMessage));
		});
	}, [agent.connection]);

	agent.useEvent("event", (event) => {
		switch (event.type) {
			case "agent_start":
				setRunning(true);
				setError(null);
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
				if (!isChatMessage(message)) break;
				setMessages((current) => [...current, message]);
				if (message.role === "assistant" && message.stopReason === "error") {
					setError(message.errorMessage ?? "The model returned an error.");
				}
				break;
			}
			case "tool_execution_start":
				setTool(event.toolName);
				break;
			case "tool_execution_end":
				setTool(null);
				break;
			case "agent_settled":
				setRunning(false);
				break;
		}
	});

	async function send(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const text = input.trim();
		if (!text || !agent.connection) return;
		setInput("");
		try {
			// While a run is in progress, new input steers it.
			if (running) await agent.connection.steer(text);
			else await agent.connection.prompt(text);
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
		}
	}

	return (
		<div>
			{agent.connStatus !== "connected" && (
				<p>{agent.connStatus === "disconnected" ? "Reconnecting…" : "Connecting…"}</p>
			)}
			<ul aria-live="polite">
				{messages.filter((message) => textOf(message)).map((message, index) => (
					<li key={index}>
						<strong>{message.role === "user" ? "You" : "Agent"}:</strong> {textOf(message)}
					</li>
				))}
				{streaming && (
					<li>
						<strong>Agent:</strong> {streaming}
					</li>
				)}
			</ul>
			{tool && <p>Running {tool}…</p>}
			{error && <p role="alert">{error}</p>}
			<form onSubmit={send}>
				<input
					value={input}
					onChange={(event) => setInput(event.target.value)}
					placeholder={running ? "Steer the agent…" : "Ask the agent…"}
				/>
				<button type="submit" disabled={!input.trim() || !agent.connection}>
					{running ? "Steer" : "Send"}
				</button>
				{running && (
					<button type="button" onClick={() => void agent.connection?.abort()}>
						Stop
					</button>
				)}
			</form>
		</div>
	);
}

function isChatMessage(message: { role: string }): message is ChatMessage {
	return message.role === "user" || message.role === "assistant";
}

function textOf(message: ChatMessage): string {
	if (typeof message.content === "string") return message.content;
	return message.content
		.flatMap((part) => (part.type === "text" ? [part.text] : []))
		.join("");
}
