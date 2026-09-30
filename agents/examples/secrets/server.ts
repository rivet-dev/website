import { Type } from "@earendil-works/pi-ai";
import { defineTool } from "@earendil-works/pi-coding-agent";
import { pi } from "@rivet-dev/pi";
import { setup } from "rivetkit";

const getOrder = defineTool({
	name: "get_order",
	label: "Get order",
	description: "Look up an order by its id.",
	parameters: Type.Object({ orderId: Type.String() }),
	async execute(_toolCallId, { orderId }) {
		const response = await fetch(`https://api.example.com/orders/${orderId}`, {
			headers: { authorization: `Bearer ${process.env.ORDERS_API_TOKEN}` },
		});
		return {
			content: [{ type: "text", text: await response.text() }],
			details: undefined,
		};
	},
});

const agent = pi({
	model: "anthropic/claude-opus-5-5",
	customTools: [getOrder],
});

export const registry = setup({ use: { agent } });
