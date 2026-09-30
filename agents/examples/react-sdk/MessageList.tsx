import type { ChatItem } from "./useAgentChat";

export function MessageList({ items, streaming }: { items: ChatItem[]; streaming: string }) {
	return (
		<ul aria-live="polite">
			{items.map((item) =>
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
			{streaming && (
				<li>
					<strong>Agent:</strong> {streaming}
				</li>
			)}
		</ul>
	);
}
