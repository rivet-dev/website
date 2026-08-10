# Vercel Workflows (Beta)

Vercel Workflows backed by Rivet Actors.

This integration is in beta. APIs may change between releases.

`@rivet-dev/vercel-world` implements the Vercel [World](https://workflow-sdk.dev/worlds) API with native Rivet Actors.

[View the complete example →](https://github.com/rivet-dev/rivet/tree/main/examples/vercel-workflow)

## Quickstart

Set up a Vercel Workflows project for your framework on Node.js 22 or newer. The
[Workflows getting-started guides](https://workflow-sdk.dev/docs/getting-started)
cover Next.js, Astro, Express, Fastify, Hono, Nitro, Nuxt, SvelteKit, TanStack
Start, and Vite.

```sh
npm install workflow @rivet-dev/vercel-world
```

Create `workflows/order.ts`:

The World starts Rivet lazily in the Workflows process. You do not need a
second server or a framework instrumentation hook.

Create `app/api/orders/[id]/route.ts`:

```ts app/api/orders/[id]/route.ts
import { start } from "workflow/api";
import { processOrder } from "@/workflows/order";

export async function POST(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const run = await start(processOrder, [id]);
	return Response.json({ runId: run.runId });
}
```

Hono has no build system of its own, so use Nitro to compile the workflow and
serve its handler in the same process.

Create `nitro.config.ts`:

Create `src/server.ts`:

Create `.env` with the variables under [Configuration](#configuration), then
build and run:

```sh
npm run build
npm run dev
```

Start a run:

```sh
curl -X POST http://localhost:3000/orders/42
```

Use Vercel's Workflow Vitest harness. The first World operation starts the
native Rivet registry and Engine in the test process:

```sh
npm test
```

## Configuration

Select the World and configure its Rivet connection in the application process:

| Variable | Required | Purpose |
| --- | --- | --- |
| `WORKFLOW_TARGET_WORLD` | Yes | Loads `@rivet-dev/vercel-world` through Vercel Workflows |
| `WORKFLOW_RUNTIME_URL` | Yes | Externally reachable base URL of the Workflows HTTP server |
| `WORKFLOW_QUEUE_NAMESPACE` | No | Shared queue namespace used by Workflows and crash-safe initial dispatch |
| `RIVET_ENDPOINT` | Remote only | Rivet control plane endpoint |
| `RIVET_NAMESPACE` | Remote only | Namespace containing the World actors |
| `RIVET_POOL` | Remote only | Pool that hosts the native World registry |
| `RIVET_TOKEN` | Cloud only | Token sent to Rivet |
| `RIVET_WORKFLOW_SECRET` | Recommended when public | Shared bearer secret for World-to-runtime delivery |

Local development starts the native Rivet control plane automatically. For production,
configure the remote Rivet connection. Run the combined server at
`WORKFLOW_RUNTIME_URL`; its World client and native registry use the same Rivet
endpoint, namespace, and pool.

## HTTP routes

Your framework integration serves the combined workflow handler at
`.well-known/workflow/v1/flow`. `WORKFLOW_RUNTIME_URL` must resolve to the
service hosting that route. Do not point it at the Rivet control plane. If
`RIVET_WORKFLOW_SECRET` is set, delivery carries that value as a bearer token and
rejects requests without it.

## Durability

The World stores runs, event logs, queues, streams, hook tokens, and recovery
alarms in Rivet Actors.

Recovery is local to each run; startup does not scan all actors. Queue an initial
workflow with the default namespace or `WORKFLOW_QUEUE_NAMESPACE`. The current
Vercel Workflows does not include a per-call `start({ namespace })` value in the
`run_created` event, so that per-call override cannot be reconstructed after a
crash and is not supported by this World.

Application code continues to use `"use workflow"`, `"use step"`,
`workflow/api`, hooks, sleeps, and streams exactly as documented by Vercel.

## Testing

`waitForSleep` observes the durable sleep, `wakeUp` resumes that exact
correlation, and the assertions wait for the final persisted result.

See the [Vercel Workflows documentation](https://useworkflow.dev) for the SDK itself.