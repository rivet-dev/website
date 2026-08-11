# Patterns

Common workflow shapes used in production systems, plus migration rules for deployed workflows.

These are common workflow shapes used in production systems.

## Store workflow progress in state + broadcast

Store progress in `state` so replay and recovery always restore it. Broadcast state changes so clients can render progress in realtime.

## Cron (queue-driven)

Rivet scheduling triggers actions. For cron-like workflows, use a small scheduled action as a bridge that enqueues work, then process that work in the workflow loop.

## Queue-driven worker

Use this when external systems enqueue work and the actor should process each item durably.

## Setup & teardown

Use this when you need one-time initialization before a long-lived loop, plus cleanup when the actor stops sleeping or is destroyed.

## Human approval gate

Use this when an operation must pause for a user or system decision before continuing.

## Fan-out / fan-in (join)

Use this when independent work items can run in parallel and you need a single merged result.

## Batch drainer

Use this when throughput matters and handling one message at a time is too expensive.

## Coordinator -> worker RPC

Use this when one actor orchestrates work by calling actions on other actors.

## Request/response over queue (async RPC)

Use this when you want decoupled actor-to-actor communication with durable waits and explicit completion.

## Scatter-gather across actors

Use this when multiple actors can process independent parts of a request in parallel, then return a merged response.

## Timeout + fallback actor

Use this when a primary actor call might be slow or unavailable and you need a deterministic fallback path.

## Cross-actor saga (compensating actions)

Use this when a workflow spans multiple actors and each side effect may need compensation.

## Signal-driven control loop

Use this when workflow progress should be triggered by commands/events instead of fixed polling intervals.

## Poll + backoff loop

Use this when an external dependency has variable availability and retries should slow down after failures.

## Child worker orchestration

Use this when one workflow coordinates many child workers (actors or worker workflows) and manages their lifecycle.

## Bounded drain + concurrency cap

Use this when inbound work can spike and you need predictable per-iteration limits.

## Versioned workflow evolution

Use this when workflow structure changes across deployments and old histories must still replay.

## Version gates with `getVersion`

Use `ctx.getVersion(name, latest)` to branch behavior when you change a workflow's logic while old instances are still in flight. It returns the version this instance is pinned to at that point:

- A fresh instance resolves to `latest`.
- An instance that already executed past this point under older code resolves to `1` (the implicit floor).

The resolved version is recorded in history, so replays are deterministic and each instance stays on the branch it started on. Inside a loop, every iteration resolves independently, so in-flight iterations finish on the old branch while new iterations pick up `latest`.

`latest` must be an integer `>= 1`, and the gate name must be unique within its scope like any other entry. Once every old instance has drained, retire the gate by replacing the call with `ctx.removed(name, "version_check")`.

## Checkpoint-friendly loop design

Use this when you need reliable replay and resume semantics across crashes and restarts.

## Migrations

- Keep workflow entry names stable once deployed.
- If an old entry was removed or renamed, call `ctx.removed(name, originalType)`.
- To change behavior at a point while old instances are still running, gate it with `ctx.getVersion(name, latest)` (see [Version gates](#version-gates-with-get-version)).
- This keeps replay compatible across deployments.