import { pi } from "@rivet-dev/pi";
import { setup } from "rivetkit";

const agent = pi({
	model: "anthropic/claude-sonnet-5",
	scopedModels: ["anthropic/claude-sonnet-5", "anthropic/claude-opus-5-5"],
});

export const registry = setup({ use: { agent } });
