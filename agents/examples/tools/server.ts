import { pi } from "@rivet-dev/pi";
import { agentOSProvider } from "@rivet-dev/sandbox-adapter/agentos";
import { setup } from "rivetkit";

const reviewer = pi({
	model: "anthropic/claude-opus-5-5",
	sandbox: agentOSProvider(),
	excludeTools: ["bash", "edit", "write"],
});

export const registry = setup({ use: { reviewer } });
