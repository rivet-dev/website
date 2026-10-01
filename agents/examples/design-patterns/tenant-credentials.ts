import { pi } from "@rivet-dev/pi";
import type { Registry } from "rivetkit";
import { credentials } from "../user-subscriptions/credentials";

export const agent = pi({
	model: "anthropic/claude-opus-5-5",
	credentials: (c) => {
		const [tenantId] = c.key;
		const client = c.client<Registry<{ credentials: typeof credentials }>>();
		return client.credentials.getOrCreate([tenantId]);
	},
});
