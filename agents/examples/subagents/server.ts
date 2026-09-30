import { Type } from "@earendil-works/pi-ai";
import { defineTool } from "@earendil-works/pi-coding-agent";
import { pi } from "@rivet-dev/pi";
import { type Registry, setup } from "rivetkit";
import { createClient } from "rivetkit/client";

const researcher = pi({ model: "anthropic/claude-opus-5-5" });

const client = createClient<Registry<{ researcher: typeof researcher }>>(
	"http://localhost:6420",
);

const research = defineTool({
	name: "research",
	label: "Research",
	description: "Research several questions at once. Each question gets its own agent.",
	parameters: Type.Object({ questions: Type.Array(Type.String()) }),
	async execute(_toolCallId, { questions }) {
		const answers = await Promise.all(
			questions.map(async (question) => {
				const subagent = client.researcher.getOrCreate([crypto.randomUUID()]);
				await subagent.prompt(question);
				return `${question}\n${await subagent.getLastAssistantText()}`;
			}),
		);
		return {
			content: answers.map((text) => ({ type: "text" as const, text })),
			details: undefined,
		};
	},
});

const lead = pi({
	model: "anthropic/claude-opus-5-5",
	customTools: [research],
});

export const registry = setup({ use: { researcher, lead } });
