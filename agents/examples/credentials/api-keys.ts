import { pi } from "@rivet-dev/pi";
import { agentOSProvider } from "@rivet-dev/sandbox-adapter/agentos";
import { setup } from "rivetkit";

const agent = pi({
	model: "anthropic/claude-opus-5-5",
	sandbox: agentOSProvider(),
	apiKeys: { anthropic: process.env.MY_ANTHROPIC_KEY ?? "" },
});

export const registry = setup({ use: { agent } });

registry.start();
