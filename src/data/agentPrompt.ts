// Shared "Copy Agent Prompt" text. A ready-to-paste prompt that points a coding
// agent at agentOS so it can scaffold a VM and verify it end to end. Keep this
// as the single source of truth so the wording never drifts between surfaces.
export const AGENT_PROMPT = `Help me get started with agentOS.

agentOS runs fast, isolated VMs for agents and the tools they use. It is a faster, lighter, cheaper alternative to sandboxes. Use it as a library inside a Node.js process (\`@rivet-dev/agentos-core\`), or as durable hosted VMs on Rivet (\`@rivet-dev/agentos\`).

Please do the following in this project:

1. Scaffold a minimal agentOS program with the library. Install \`@rivet-dev/agentos-core\`. Boot a VM with \`AgentOs.create()\`, run a shell command with \`vm.process.exec(...)\`, write and read a file with \`vm.filesystem\`, and call \`vm.dispose()\` when done. The default software bundle already includes coreutils (with \`sh\`), sed, grep, gawk, findutils, diffutils, tar, and gzip.

2. Install one extra tool from the agentOS software registry, such as \`ripgrep\`. Registry software ships as digest-addressed \`.aospkg\` files, not npm packages. Fetch \`https://releases.rivet.dev/agent-os/latest/software/manifest.json\`, find the artifact by \`name\`, and after the VM boots call \`vm.software.install({ type: "url", url, expectedDigest })\` with the artifact's \`path\` resolved against the manifest URL and its \`digest\`. Use \`{ packagePath }\` instead for a local \`.aospkg\` file. Do not install \`@agentos-software/*\` packages from npm or import \`rivetkit/agent-os\`; both are removed.

3. Actually test it end to end. Don't stop at "it compiles". Run the program and confirm the shell command output, the file contents, and that the installed tool runs inside the VM (for example \`rg --version\`).

4. If I need durable VMs that clients reach by ID, use hosted agentOS instead: create a VM with \`createAgentOsClient\` from \`@rivet-dev/agentos\` and install software with \`vm.v1.software.install({ source: { url, digest } })\`. See https://rivet.dev/agentos/docs/quickstart-hosted.

5. Read the documentation at https://rivet.dev/agentos/docs (software installs: https://rivet.dev/agentos/docs/software, available packages: https://rivet.dev/agentos/docs/registry), and consult it whenever you get stuck.

If you get stuck and the docs don't unblock you, tell me to ask for help in Discord (https://rivet.dev/discord) and to open a GitHub issue (https://github.com/rivet-dev/agentos/issues).`;
