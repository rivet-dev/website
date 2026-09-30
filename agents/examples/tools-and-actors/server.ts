import { Type } from "@earendil-works/pi-ai";
import { defineTool } from "@earendil-works/pi-coding-agent";
import { pi } from "@rivet-dev/pi";
import { actor, type Registry, setup } from "rivetkit";
import { createClient } from "rivetkit/client";

const ticket = actor({
	state: { owner: null as string | null },
	actions: {
		claim: (c, agentId: string) => {
			c.state.owner ??= agentId;
			return c.state.owner;
		},
	},
});

const client = createClient<Registry<{ ticket: typeof ticket }>>({
	endpoint: process.env.RIVET_ENDPOINT ?? "http://localhost:6420",
});

const claimTicket = defineTool({
	name: "claim_ticket",
	label: "Claim ticket",
	description: "Claim a support ticket before working on it. Stop if another agent owns it.",
	parameters: Type.Object({ ticketId: Type.String() }),
	async execute(_toolCallId, { ticketId }, _signal, _onUpdate, ctx) {
		const me = ctx.sessionManager.getSessionId();
		const owner = await client.ticket.getOrCreate([ticketId]).claim(me);
		const text =
			owner === me
				? `You own ticket ${ticketId}.`
				: `Another agent is already working on ticket ${ticketId}.`;
		return { content: [{ type: "text", text }], details: undefined };
	},
});

const agent = pi({
	model: "anthropic/claude-opus-5-5",
	customTools: [claimTicket],
});

export const registry = setup({ use: { ticket, agent } });
