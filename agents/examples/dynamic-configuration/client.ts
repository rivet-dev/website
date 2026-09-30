import { createClient } from "rivetkit/client";
import type { registry } from "./server";

const client = createClient<typeof registry>("http://localhost:6420");

async function ask(tenant: { id: string; provider: "anthropic" | "openai" }, text: string) {
	const agent = client.agent.getOrCreate([tenant.id]);
	if (tenant.provider === "openai") {
		await agent.setModel("openai", "gpt-6-astra");
	}
	await agent.prompt(text);
	return agent.getLastAssistantText();
}

console.log(await ask({ id: "acme", provider: "openai" }, "Summarize this week's incidents."));
