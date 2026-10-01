import { createClient } from "rivetkit/client";
import type { registry } from "../quickstart/server";

const client = createClient<typeof registry>();

export function agentsFor(userId: string, threadId: string, taskId: string) {
	return {
		user: client.agent.getOrCreate(["user", userId]),
		thread: client.agent.getOrCreate(["thread", threadId]),
		task: client.agent.getOrCreate(["task", taskId]),
	};
}
