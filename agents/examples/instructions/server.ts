import {
	DefaultResourceLoader,
	getAgentDir,
} from "@earendil-works/pi-coding-agent";
import { pi } from "@rivet-dev/pi";
import { setup } from "rivetkit";

const resourceLoader = new DefaultResourceLoader({
	cwd: process.cwd(),
	agentDir: getAgentDir(),
	appendSystemPrompt: [
		"You review pull requests for the payments team. Be brief and cite file paths.",
	],
	noContextFiles: true,
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
