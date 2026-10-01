import { pi } from "@rivet-dev/pi";
import { actor, setup } from "rivetkit";

const agent = pi({ model: "anthropic/claude-opus-5-5" });

const tenant = actor({
	state: { budgetUsd: 100, spentUsd: 0 },
	actions: {
		remaining: (c) => c.state.budgetUsd - c.state.spentUsd,
		spend: (c, usd: number) => {
			c.state.spentUsd += usd;
		},
	},
});

export const registry = setup({ use: { agent, tenant } });
