import { pi } from "@rivet-dev/pi";
import { setup } from "rivetkit";

const agent = pi({
	model: "anthropic/claude-opus-5-5",
	scopedModels: ["anthropic/claude-opus-5-5", "openai/gpt-6-astra"],
});

export const registry = setup({ use: { agent } });
