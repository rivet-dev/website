import { Composer } from "./Composer";
import { MessageList } from "./MessageList";
import { useAgentChat } from "./useAgentChat";

export function Chat({ userId }: { userId: string }) {
	const chat = useAgentChat(["support", userId]);

	return (
		<section>
			{chat.connStatus !== "connected" && (
				<p>{chat.connStatus === "disconnected" ? "Reconnecting…" : "Connecting…"}</p>
			)}
			<MessageList items={chat.items} streaming={chat.streaming} />
			{chat.error && <p role="alert">{chat.error}</p>}
			<Composer
				running={chat.running}
				disabled={!chat.ready}
				onSend={chat.send}
				onStop={chat.stop}
			/>
		</section>
	);
}
