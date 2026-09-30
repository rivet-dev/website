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
	async execute(_toolCallId, { orderId }) {
		const response = await fetch(
			`https://api.example.com/orders/${encodeURIComponent(orderId)}`,
			{ headers: { authorization: `Bearer ${process.env.ORDERS_API_TOKEN}` } },
		);
		if (!response.ok) {
			return {
				content: [{ type: "text", text: `Order lookup failed with status ${response.status}.` }],
				details: undefined,
			};
		}
		const order = (await response.json()) as { status: string; total: number };
		return {
			content: [{ type: "text", text: `Status: ${order.status}. Total: $${order.total}.` }],
			details: undefined,
		};
	},
});

const agent = pi({
	model: "anthropic/claude-opus-5-5",
	sandbox: agentOSProvider(),
	customTools: [getOrder],
});

export const registry = setup({ use: { agent } });
