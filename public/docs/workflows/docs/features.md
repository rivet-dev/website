# Features

Queue waits, request/response, timers, join, race, timeouts, error hooks, and rollback.

## Queue

Use this for fire-and-forget commands where the client does not need a reply.

Use the [`Loops`](/workflows/docs/quickstart#loops) example above as the baseline pattern.

## Request/response (using queue)

Use this when the caller needs a response from queued processing.

## Timers

Use queue messages as the trigger source, then sleep durably inside the workflow.

## Join

Use `join` when several independent tasks can run in parallel.

## Race

Use `race` when you need first-winner behavior.

## Timeouts

Use step timeouts and retries for slow or flaky dependencies.

Step timeouts are critical by default and fail immediately. Set `retryOnTimeout: true` if a timeout should retry like any other error using `maxRetries`.

Workflows use roll-forward semantics everywhere. When a step throws, any `state` or `vars` mutations it made before failing are never rolled back, whether the step retries or the failure is caught by `tryStep` or `try`. The next attempt observes whatever the failed attempt already wrote, so write steps idempotently: check before you increment, or move the mutation after the fallible work.

## Handling terminal failures as data

Use `tryStep` when a step failure should produce data instead of failing the whole workflow.

Use `try` when you want to recover from terminal `step`, `join`, or `race` failures inside a named block.

```ts
async function runPaymentFlow(ctx: any) {
  return await ctx.try("payment-flow", async (blockCtx: any) => {
    const auth = await blockCtx.step("authorize", async (blockCtx) =>
      authorizeOrder("order-123"),
    );
    const capture = await blockCtx.step("capture", async (blockCtx) =>
      captureOrder("order-123"),
    );
    return { auth, capture };
  });
}

async function authorizeOrder(orderId: string): Promise<string> {
  return `auth-${orderId}`;
}

async function captureOrder(orderId: string): Promise<string> {
  return `capture-${orderId}`;
}
```

- `tryStep` and `try` only catch terminal failures. Retry backoff, sleeps, queue waits, eviction, and history divergence still rethrow.
- Catching a failure does not undo it. `state` and `vars` mutations made before the failure remain visible after `tryStep` or `try` returns, so use explicit compensating steps when a caught failure needs cleanup.
- `RollbackError` is not caught by default. Pass `catch: ["rollback"]` when you want rollback failures returned as data.

## Error hooks

Use `onError` when you want a best-effort notification for workflow failures.

- Step failures include the attempt number, retry counts, whether the step will retry, and the next retry delay.
- Workflow failures also include terminal errors outside steps, such as rollback failures or code/history mismatches.
- The hook is observational. It is not part of workflow replay, so use it for logging, metrics, or updating non-critical actor state.
- This is also a good place to forward workflow failures to Sentry or another error reporting pipeline.

## Rollback

Use rollback checkpoints before steps that have compensating actions.