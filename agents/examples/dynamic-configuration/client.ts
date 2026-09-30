import { createClient } from "rivetkit/client";
import type { registry } from "./server";

const client = createClient<typeof registry>("http://localhost:6420");

async function ask(tenant: { id: string; plan: "free" | "pro" }, text: string) {
	const agent = client.agent.getOrCreate([tenant.id]);
	if (tenant.plan === "pro") {
		await agent.setModel("anthropic", "claude-opus-5-5");
	}
	await agent.prompt(text);
	return agent.getLastAssistantText();
}

console.log(await ask({ id: "acme", plan: "pro" }, "Summarize this week's incidents."));
