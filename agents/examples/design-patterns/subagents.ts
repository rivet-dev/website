import { createClient } from "rivetkit/client";
import type { registry } from "../subagents/server";

const client = createClient<typeof registry>();

export async function ask(question: string) {
	const researcher = client.researcher.getOrCreate([crypto.randomUUID()]);
	await researcher.prompt(question);
	const answer = await researcher.getLastAssistantText();
	await researcher.finish();
	return answer;
}
