import { createClient } from "rivetkit/client";
import type { registry } from "../quickstart/server";

const client = createClient<typeof registry>();

export async function answer(message: string) {
	const agent = client.agent.getOrCreate([crypto.randomUUID()]);
	await agent.prompt(message);
	return agent.getLastAssistantText();
}
