import { createClient } from "rivetkit/client";
import type { registry } from "../quickstart/server";

const client = createClient<typeof registry>();

export async function answer(userId: string, message: string) {
	const agent = client.agent.getOrCreate(["support"]);
	await agent.prompt(`${userId}: ${message}`);
	return agent.getLastAssistantText();
}
