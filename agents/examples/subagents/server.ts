import { Type } from "@earendil-works/pi-ai";
import { defineTool } from "@earendil-works/pi-coding-agent";
import { pi } from "@rivet-dev/pi";
import { type Registry, setup } from "rivetkit";
import { createClient } from "rivetkit/client";

const research = defineTool({
	name: "research",
	label: "Research",
	description: "Research several questions at once. Each question gets its own agent.",
	parameters: Type.Object({ questions: Type.Array(Type.String()) }),
	async execute(_toolCallId, { questions }) {
		const answers = await Promise.all(questions.map(askResearcher));
		return { content: answers.map((text) => ({ type: "text" as const, text })), details: undefined };
	},
});

const lead = pi({ model: "anthropic/claude-opus-5-5", customTools: [research] });

const researcher = pi({
	model: "anthropic/claude-opus-5-5",
	actions: { finish: (c) => c.destroy() },
});

const client = createClient<Registry<{ researcher: typeof researcher }>>();

export const registry = setup({ use: { lead, researcher } });

async function askResearcher(question: string) {
	const subagent = client.researcher.getOrCreate([crypto.randomUUID()]);
	await subagent.prompt(question);
	const answer = await subagent.getLastAssistantText();
	await subagent.finish();
	return `${question}\n${answer}`;
}
