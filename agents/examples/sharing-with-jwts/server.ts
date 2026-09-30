import { Type } from "@earendil-works/pi-ai";
import { defineTool } from "@earendil-works/pi-coding-agent";
import { pi } from "@rivet-dev/pi";
import { actor, type Registry, setup } from "rivetkit";
import { createClient } from "rivetkit/client";

const report = actor({
	state: { title: "", body: "" },
	actions: {
		save: (c, title: string, body: string) => {
			c.state.title = title;
			c.state.body = body;
		},
		read: (c) => c.state,
	},
});

const admin = createClient<Registry<{ report: typeof report }>>({
	endpoint: process.env.RIVET_ENDPOINT,
	namespace: process.env.RIVET_NAMESPACE,
	token: process.env.RIVET_ADMIN_TOKEN,
});

const shareReport = defineTool({
	name: "share_report",
	label: "Share report",
	description: "Publish a report and return a link anyone can open for the next hour.",
	parameters: Type.Object({ title: Type.String(), body: Type.String() }),
	async execute(_toolCallId, { title, body }) {
		const handle = admin.report.getOrCreate([crypto.randomUUID()]);
		await handle.save(title, body);
		const { token } = await handle.issueToken({ subject: "shared-report", expiresIn: 3600 });
		const url = `https://app.example.com/reports/${await handle.resolve()}#${token}`;
		return { content: [{ type: "text", text: `Shared at ${url}` }], details: { url } };
	},
});

const agent = pi({
	model: "anthropic/claude-opus-5-5",
	customTools: [shareReport],
});

export const registry = setup({ use: { report, agent } });
