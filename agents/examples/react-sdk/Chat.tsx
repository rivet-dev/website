import { type FormEvent, useState } from "react";
import { useAgentChat } from "./useAgentChat";

export function Chat({ userId }: { userId: string }) {
	const chat = useAgentChat(["support", userId]);
	const [text, setText] = useState("");

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const trimmed = text.trim();
		if (!trimmed) return;
		void chat.send(trimmed);
		setText("");
	}

	return (
		<section>
			{chat.connStatus !== "connected" && (
				<p>{chat.connStatus === "disconnected" ? "Reconnecting…" : "Connecting…"}</p>
			)}
			<ul aria-live="polite">
				{chat.items.map((item) =>
					item.kind === "message" ? (
						<li key={item.id}>
							<strong>{item.role === "user" ? "You" : "Agent"}:</strong> {item.text}
						</li>
					) : (
						<li key={item.id}>
							<code>{item.name}</code> {item.status === "running" ? "…" : item.status}
						</li>
					),
				)}
				{chat.streaming && (
					<li>
						<strong>Agent:</strong> {chat.streaming}
					</li>
				)}
			</ul>
			{chat.error && <p role="alert">{chat.error}</p>}
			<form onSubmit={submit}>
				<input
					value={text}
					onChange={(event) => setText(event.target.value)}
					placeholder={chat.running ? "Steer the agent…" : "Ask the agent…"}
				/>
				<button type="submit" disabled={!chat.ready || !text.trim()}>
					{chat.running ? "Steer" : "Send"}
				</button>
				{chat.running && (
					<button type="button" onClick={chat.stop}>
						Stop
					</button>
				)}
			</form>
		</section>
	);
}
