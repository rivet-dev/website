import { pi } from "@rivet-dev/pi";
import { type Registry, setup } from "rivetkit";
import { credentials } from "./credentials";

const agent = pi({
	model: "anthropic/claude-opus-5-5",
	credentials: (c) =>
		c
			.client<Registry<{ credentials: typeof credentials }>>()
			.credentials.getOrCreate([c.key[0]]),
});

export const registry = setup({ use: { credentials, agent } });
