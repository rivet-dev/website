import { actor, setup } from "rivetkit";
import { streamText, type ModelMessage } from "ai";
import { openai } from "@ai-sdk/openai";

// One actor per agent: its transcript is durable state, its inbox is a queue,
// and its output streams to every connected client.
export const agent = actor({
	state: { messages: [] as ModelMessage[] },

	run: async (c) => {
		for await (const msg of c.queue.iter<{ text: string }>()) {
			c.state.messages.push({ role: "user", content: msg.body.text });

			const response = streamText({
				model: openai("gpt-5"),
				messages: c.state.messages,
			});

			for await (const delta of response.textStream) {
				c.broadcast("token", delta);
			}

			c.state.messages.push({ role: "assistant", content: await response.text });
		}
	},
});

export const registry = setup({ use: { agent } });
