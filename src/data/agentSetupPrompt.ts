// Shared "Set up with your agent" prompt for the four product landing pages.
// One template so the wording never drifts between products; each product
// supplies its name, package, quickstart, and docs root. The prompt asks the
// agent to follow the quickstart, but to brief the user before touching files.

export interface AgentSetupTarget {
	product: string;
	packageName: string;
	quickstartUrl: string;
	docsUrl: string;
	issuesUrl: string;
}

export const buildAgentSetupPrompt = ({ product, packageName, quickstartUrl, docsUrl, issuesUrl }: AgentSetupTarget) =>
	`Help me set up ${product} (\`${packageName}\`) in this project.

Follow the quickstart at ${quickstartUrl} to get started.

Before you implement anything, tell me:
1. Which files you're going to create or edit.
2. What I'll be able to do once you're done.
3. Any questions you have about how this project should use it.

Then implement it and verify it actually runs end to end. Don't stop at "it compiles". Consult the docs at ${docsUrl} whenever you get stuck.

If the docs don't unblock you, tell me to ask for help in Discord (https://rivet.dev/discord) or file an issue on GitHub (${issuesUrl}).`;

export const AGENT_SETUP_PROMPTS = {
	actors: buildAgentSetupPrompt({
		product: 'Rivet Actors',
		packageName: 'rivetkit',
		quickstartUrl: 'https://rivet.dev/actors/docs/quickstart/backend/',
		docsUrl: 'https://rivet.dev/actors/docs/',
		issuesUrl: 'https://github.com/rivet-dev/actors/issues',
	}),
	agentos: buildAgentSetupPrompt({
		product: 'agentOS',
		packageName: '@rivet-dev/agentos',
		quickstartUrl: 'https://rivet.dev/agentos/docs/quickstart/',
		docsUrl: 'https://rivet.dev/agentos/docs/',
		issuesUrl: 'https://github.com/rivet-dev/agentos/issues',
	}),
	workflows: buildAgentSetupPrompt({
		product: 'Rivet Workflows',
		packageName: '@rivet-dev/workflows',
		quickstartUrl: 'https://rivet.dev/workflows/docs/quickstart/',
		docsUrl: 'https://rivet.dev/workflows/docs/',
		issuesUrl: 'https://github.com/rivet-dev/actors/issues',
	}),
	'dynamic-apps': buildAgentSetupPrompt({
		product: 'Dynamic Apps',
		packageName: '@rivet-dev/dynamic-apps',
		quickstartUrl: 'https://rivet.dev/dynamic-apps/docs/quickstart/',
		docsUrl: 'https://rivet.dev/dynamic-apps/docs/',
		issuesUrl: 'https://github.com/rivet-dev/dynamic-apps/issues',
	}),
} as const;
