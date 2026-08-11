# Reference

Step-only access to actor APIs, workflow history debugging, and recommendations.

## Step-only access to actor APIs

`state`, `vars`, `db`, `client()`, and connection/event APIs are only valid inside `ctx.step(...)` callbacks.

Use non-step workflow code for orchestration only: queue waits, sleeps, loops, joins, races, and rollback boundaries. Keep actor-local side effects in steps.

## Debugging

- `GET /inspector/workflow-history` returns workflow history status for an actor.
- Response includes `isWorkflowEnabled` and `history`.
- In non-dev mode, inspector endpoints require authorization.

## Recommendations

- Prefer queue-driven loops for long-lived workflows.
- Structure long-lived workflows with setup and teardown around the main loop.
- Keep actor state changes and side effects inside steps.
- Store workflow progress in `state` and broadcast updates as progress changes.
- Use timeouts and rollback for external side effects.
- Write step bodies idempotently. `state` and `vars` mutations from a failed attempt are never rolled back, whether the step retries or `tryStep`/`try` catches the failure.