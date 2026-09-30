import { Type } from "@earendil-works/pi-ai";
import { defineTool } from "@earendil-works/pi-coding-agent";
import { pi } from "@rivet-dev/pi";
import { agentOSProvider } from "@rivet-dev/sandbox-adapter/agentos";
import { setup } from "rivetkit";

const getOrder = defineTool({
	name: "get_order",
	label: "Get order",
	description: "Look up an order's status by its id.",
	parameters: Type.Object({ orderId: Type.String() }),
	async execute(_toolCallId, { orderId }, signal) {
		const response = await fetch(
			`https://api.example.com/orders/${encodeURIComponent(orderId)}`,
			{ headers: { authorization: `Bearer ${process.env.ORDERS_API_TOKEN}` }, signal },
		);
		if (response.status === 404) throw new Error(`No order with id ${orderId}.`);
		if (!response.ok) throw new Error(`The orders API returned ${response.status}.`);
		const order = (await response.json()) as { status: string; total: number };
		return {
			content: [{ type: "text", text: `Status: ${order.status}. Total: $${order.total}.` }],
			details: order,
		};
	},
});

const agent = pi({
	model: "anthropic/claude-opus-5-5",
	sandbox: agentOSProvider(),
	customTools: [getOrder],
});

export const registry = setup({ use: { agent } });
