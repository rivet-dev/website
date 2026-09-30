import { createRivetKit } from "@rivetkit/react";
import { useState } from "react";
import type { registry } from "./server";

const { useActor } = createRivetKit<typeof registry>("http://localhost:6420");

export function Approval({ userId }: { userId: string }) {
	const agent = useActor({ name: "agent", key: ["deploys", userId] });
	const [pending, setPending] = useState<string | null>(null);

	agent.useEvent("event", (event) => {
		if (event.type === "tool_execution_start" && event.toolName === "request_approval") {
			setPending(event.args.action);
		}
	});

	function answer(text: string) {
		setPending(null);
		void agent.connection?.prompt(text, { streamingBehavior: "followUp" });
	}

	if (!pending) return null;

	return (
		<div role="alertdialog">
			<p>The agent wants to: {pending}</p>
			<button type="button" onClick={() => answer("Approved. Go ahead.")}>
				Approve
			</button>
			<button type="button" onClick={() => answer("Rejected. Don't do it.")}>
				Reject
			</button>
		</div>
	);
}
