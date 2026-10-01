import { pi } from "@rivet-dev/pi";
import { agentOSProvider } from "@rivet-dev/sandbox-adapter/agentos";
import { setup } from "rivetkit";
import { getOrder } from "./get-order";

const agent = pi({
	model: "anthropic/claude-opus-5-5",
	sandbox: agentOSProvider(),
	customTools: [getOrder],
});

export const registry = setup({ use: { agent } });

registry.start();
