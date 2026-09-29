import { pi } from "@rivet-dev/pi";
import { setup } from "rivetkit";

const agent = pi({
	model: "anthropic/claude-opus-5-5",
	// Keys by provider id. They stay in the Actor's memory and win over the
	// environment and the credentials Actor.
	apiKeys: {
		anthropic: process.env.MY_ANTHROPIC_KEY ?? "",
	},
});

export const registry = setup({ use: { agent } });
