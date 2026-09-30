import { Type } from "@earendil-works/pi-ai";
import { defineTool } from "@earendil-works/pi-coding-agent";
import { pi } from "@rivet-dev/pi";
import { agentOSProvider } from "@rivet-dev/sandbox-adapter/agentos";
import { setup } from "rivetkit";

const coreutils = {
	url: "https://unpkg.com/@agentos-software/coreutils@0.3.5/dist/package.aospkg",
	digest: "sha256:a291a48ce90b0ad12d3937e771d9aaec37b289c1f5b047fe3d1d61151dbeee51",
};

const requestApproval = defineTool({
	name: "request_approval",
	label: "Request approval",
	description:
		"Ask the user to approve an action before you take it. After calling this, end your turn and wait for their reply.",
	parameters: Type.Object({ action: Type.String() }),
	async execute(_toolCallId, { action }) {
		return {
			content: [{ type: "text", text: `Waiting for the user to approve: ${action}` }],
			details: undefined,
		};
	},
});

const agent = pi({
	model: "anthropic/claude-opus-5-5",
	sandbox: agentOSProvider({ software: [coreutils] }),
	customTools: [requestApproval],
});

export const registry = setup({ use: { agent } });
