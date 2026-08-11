# Flue

Run Flue agents on Rivet with agentOS sandboxes.

This integration is in beta. APIs may change between releases.

Flue owns the agent runtime and session lifecycle. Rivet maps each agent instance and workflow run to a durable Rivet Actor, while agentOS gives each Flue context an isolated VM with a persistent `/workspace` filesystem.

This integration currently uses [Rivet's Flue fork](https://github.com/rivet-dev/flue).
We're working to merge its generic target-authoring and runtime extension APIs
[upstream](https://github.com/withastro/flue/discussions/516), allowing Flue to
support actor-model runtimes without taking a Rivet dependency.

[View the complete example →](https://github.com/rivet-dev/agentos/tree/main/examples/flue)

## Quickstart

```sh
mkdir my-agent && cd my-agent
npm init -y
npm pkg set type=module
npm add "@flue/runtime@npm:@rivet-dev/labs-flue-runtime"
npm add --save-dev "@flue/cli@npm:@rivet-dev/labs-flue-cli"
npx flue init --target node
```

```sh
npm add @rivet-dev/flue @rivet-dev/agentos @rivet-dev/agentos-flue rivetkit
```

- `@rivet-dev/labs-flue-*`: Rivet-maintained preview builds of Flue's proposed extension APIs.
- `@rivet-dev/flue`: Runs Flue agents and workflows as Rivet Actors.
- `@rivet-dev/agentos`: Provides the isolated VM actor.
- `@rivet-dev/agentos-flue`: Connects Flue's sandbox API to agentOS.

Create `actors.ts`:

```ts title="actors.ts"
import { agentOS, setup } from "@rivet-dev/agentos";

const vm = agentOS({
	// Configure software, permissions, mounts, and resource limits here.
});

export const registry = setup({
	use: { vm },
});
```

Update `flue.config.ts`:

```ts title="flue.config.ts"
import { defineConfig } from "@flue/cli/config";
import { rivet } from "@rivet-dev/flue";

export default defineConfig({
	target: rivet({ actors: "./actors.ts" }),
});
```

The generated Flue server adds its agent and workflow actors to this registry.
It keeps Flue's native router as the public HTTP service; the Rivet target only
selects and hosts the durable actors behind those routes.

Create `agents/assistant.ts`:

```ts title="assistant.ts"
import { type AgentRouteHandler, createAgent } from "@flue/runtime";
import { agentOSSandbox } from "@rivet-dev/agentos-flue";
import { registry } from "../actors.js";

export const route: AgentRouteHandler = async (_context, next) => next();

export default createAgent(() => ({
	model: "anthropic/claude-sonnet-5",
	instructions:
		"Help the user work in /workspace. Use filesystem and shell tools when asked.",
	sandbox: agentOSSandbox({ actor: "vm", registry }),
}));
```

Set the provider key required by your model, such as `ANTHROPIC_API_KEY`, in `.env`.

```sh
npx flue connect assistant local
```

Flue builds the Rivet target, starts the local Rivet engine, and connects to the `assistant/local` actor.

Ask it to use both filesystem and shell operations:

> Write `hello from Flue` to `/workspace/hello.txt`, run `wc -c
> /workspace/hello.txt`, then read the file back.

Reconnect to `assistant/local` and ask it to read the file again. The same Flue
context reconnects to the same agentOS actor and persistent filesystem.

## Runtime model

Each Flue agent instance and workflow run has its own Rivet Actor and SQLite database. Direct prompts and `dispatch()` inputs use the same durable admission path, so accepted work can recover after interruption.

Normal agent and workflow requests return their `202` receipt after persisting the admission, its canonical input event, and a recovery alarm. Rivet then owns the turn as background work through `c.keepAwake(...)`; the caller does not remain attached while the model or workflow runs. Workflow requests with `?wait=result` are the explicit exception and stay open until the result is available.

The agentOS adapter derives a stable VM actor key from the Flue context ID. Reusing a context reconnects to the same durable `/workspace` filesystem.

agentOS does not support Cloudflare Workers yet. It works with Node.js, Bun, or
Deno on platforms such as Railway, Kubernetes, or Vercel.

## Configuration

`rivet()` accepts an optional `actors` module path, defaulting to `./actors.ts`. That module must export a `registry` created with `setup()`; the target adds its generated actors to that registry.

`agentOSSandbox()` accepts:

| Option | Required | Description |
| --- | --- | --- |
| `actor` | Yes | agentOS actor name from the registry, such as `vm`. |
| `registry` | Yes | The same application registry exported from `actors.ts`. |
| `params` | No | Parameters passed when connecting to a new agentOS actor. |
| `cwd` | No | Sandbox working directory. Defaults to `/workspace`. |
| `client` | No | Existing client configured for the same registry. |

[Read the agentOS + Flue documentation →](https://agentos-sdk.dev/docs/frameworks/flue)