import { createRivetKit } from "@rivetkit/react";
import { type FormEvent, useState } from "react";
import type { registry } from "../pi/server";

const { useActor } = createRivetKit<typeof registry>("http://localhost:6420");

export function Chat() {
	const agent = useActor({ name: "agent", key: ["support", "customer-123"] });
	const [reply, setReply] = useState("");
	const [running, setRunning] = useState(false);

	agent.useEvent("event", (event) => {
		if (event.type === "agent_start") {
			setReply("");
			setRunning(true);
		}
		if (event.type === "message_update" && event.assistantMessageEvent.type === "text_delta") {
			const { delta } = event.assistantMessageEvent;
			setReply((text) => text + delta);
		}
		if (event.type === "agent_end") setRunning(false);
	});

	function send(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const input = event.currentTarget.elements.namedItem("prompt") as HTMLInputElement;
		void agent.connection?.prompt(input.value);
		input.value = "";
	}

	return (
		<div>
			<form onSubmit={send}>
				<input name="prompt" disabled={running} />
				{running ? (
					<button type="button" onClick={() => agent.connection?.abort()}>
						Stop
					</button>
				) : (
					<button type="submit">Send</button>
				)}
			</form>
			<p>{reply}</p>
		</div>
	);
}
