import {
	DefaultResourceLoader,
	getAgentDir,
} from "@earendil-works/pi-coding-agent";
import { pi } from "@rivet-dev/pi";
import { setup } from "rivetkit";

const resourceLoader = new DefaultResourceLoader({
	cwd: process.cwd(),
	agentDir: getAgentDir(),
	// Added to the default system prompt. Pass a file path to read it from disk.
	appendSystemPrompt: [
		"You review pull requests for the payments team. Be brief and cite file paths.",
	],
	// Skip AGENTS.md discovery and supply the project context inline.
	noContextFiles: true,
	agentsFilesOverride: () => ({
		agentsFiles: [
			{
				path: "AGENTS.md",
				content: "Run `npm test` before proposing a fix. Never edit files in `migrations/`.",
			},
		],
	}),
	noExtensions: true,
	noSkills: true,
	noPromptTemplates: true,
	noThemes: true,
});
await resourceLoader.reload();

const agent = pi({
	model: "anthropic/claude-opus-5-5",
	resourceLoader,
});

export const registry = setup({ use: { agent } });
