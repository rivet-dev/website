# Versions & Upgrades

When you deploy new code, Rivet ensures actors are upgraded seamlessly without downtime.

## How Versions Work

Each runner has a **version number**. When you deploy new code with a new version, Rivet handles the transition automatically:

- **New actors go to the newest version**: When allocating actors, Rivet always prefers runners with the highest version number
- **Multiple versions can coexist**: Old actors continue running on old versions while new actors are created on the new version
- **Drain old actors**: When enabled, a runner connecting with a newer version number will gracefully stop old actors to be rescheduled to the new version

Versions are not configured by default. See [Registry Configuration](/actors/docs/general/registry-configuration) to learn how to configure the runner version.

`RIVET_ENVOY_VERSION` is only needed when self-hosting or using a custom runner. Rivet Cloud handles versioning automatically.

### Example Scenario

When a new version is deployed, existing actors are gracefully stopped on the old runner and rescheduled onto the new version.

    <marker id="versions-sequence-1-request-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#1b1916"/></marker>
  <text x="85" y="39" text-anchor="middle" font-size="11" font-weight="600" fill="#1b1916">Runner v1</text>
  <text x="435" y="39" text-anchor="middle" font-size="11" font-weight="600" fill="#1b1916">Runner v2</text>
  <text x="91" y="94" text-anchor="middle" font-size="10" fill="#1b1916">Currently running</text>
  <text x="429" y="140" text-anchor="middle" font-size="10" fill="#1b1916">Deployed</text>
  <text x="260" y="176" text-anchor="middle" font-size="10" fill="#56524a">Drain old actors</text>
  <text x="260" y="218" text-anchor="middle" font-size="10" fill="#56524a">Reschedule actors</text>
  <text x="121" y="270" text-anchor="middle" font-size="10" fill="#1b1916">Shut down when all actors stopped</text>

When a new version is deployed, both versions coexist. New actors are created on the new version while existing actors continue running on the old version until.

  <text x="85" y="39" text-anchor="middle" font-size="11" font-weight="600" fill="#1b1916">Runner v1</text>
  <text x="435" y="39" text-anchor="middle" font-size="11" font-weight="600" fill="#1b1916">Runner v2</text>
  <text x="91" y="94" text-anchor="middle" font-size="10" fill="#1b1916">Currently running</text>
  <text x="429" y="140" text-anchor="middle" font-size="10" fill="#1b1916">Deployed</text>
  <text x="112" y="186" text-anchor="middle" font-size="10" fill="#1b1916">Actor 1 sleeps from inactivity</text>
  <text x="408" y="232" text-anchor="middle" font-size="10" fill="#1b1916">Actor 1 wakes up when prompted</text>

## Configuration

### Setting the Version

Configure the runner version using an environment variable or programmatically:

```bash
RIVET_ENVOY_VERSION=2
```

The version **must** be set at build time, not at runtime. Do not use `Date.now()` or similar runtime values in your registry setup code. This would assign a different version every time the server starts, causing actors to be drained and rescheduled on every restart instead of only on new deployments.

### Example Configurations

We recommend injecting a build-time value that increments with every deployment. Here are concrete examples for common setups:

Generate the version at build time and bake it into the image as an environment variable:

```bash @nocheck
docker build --build-arg RIVET_ENVOY_VERSION=$(date +%s) .
```

```dockerfile @nocheck
FROM node:20-slim
ARG RIVET_ENVOY_VERSION
ENV RIVET_ENVOY_VERSION=$RIVET_ENVOY_VERSION
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD ["node", "dist/server.js"]
```

All containers from this image will share the same version.

Set the version in `next.config.ts`. Next.js evaluates this file once at build time and inlines the value into the bundle:

```typescript @nocheck
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    RIVET_ENVOY_VERSION: String(Math.floor(Date.now() / 1000)),
  },
};

export default nextConfig;
```

Use `define` in your Vite config. This is evaluated once at build time and inlined into the bundle:

```typescript @nocheck
import { defineConfig } from "vite";

export default defineConfig({
  define: {
    "process.env.RIVET_ENVOY_VERSION": JSON.stringify(
      String(Math.floor(Date.now() / 1000))
    ),
  },
});
```

Set the version from your CI pipeline:

```yaml @nocheck
# GitHub Actions
env:
  RIVET_ENVOY_VERSION: ${{ github.run_number }}
```

```bash @nocheck
# Railway / Render / generic CI
export RIVET_ENVOY_VERSION=$(date +%s)
```

```bash @nocheck
# Git commit count
export RIVET_ENVOY_VERSION=$(git rev-list --count HEAD)
```

Generate a version file during your build step and import it:

```json @nocheck
{
  "scripts": {
    "build": "echo \"export const BUILD_VERSION = $(date +%s);\" > src/build-version.ts && tsc"
  }
}
```

```typescript @nocheck
import { actor, setup } from "rivetkit";
import { BUILD_VERSION } from "./build-version";

const myActor = actor({ state: {}, actions: {} });

const registry = setup({
  use: { myActor },
  envoy: {
    version: BUILD_VERSION,
  },
});
```

### Drain on Version Upgrade

The `drainOnVersionUpgrade` option controls whether old actors are stopped when a new version is deployed. This is configured in the Rivet dashboard under your runner configuration. See [Pool Configuration](/actors/docs/general/pool-configuration) for the full set of pool options, including how to rate-limit actor eviction during the drain.

| Value | Behavior |
|-------|----------|
| `false` | Old actors continue running. New actors go to new version. Versions coexist. |
| `true` (default) | Old actors receive stop signal and have 30m to finish gracefully. |

## Upgrading Actor State

When you deploy a new version, existing actors may need to handle schema changes in their persisted data.

### SQLite (recommended for complex schemas)

**Drizzle (recommended)**

Use [Drizzle](/actors/docs/sqlite-drizzle) for typed schemas with generated migrations. Drizzle generates versioned `.sql` migration files from your TypeScript schema and applies them in order automatically. This is the recommended approach when your schema evolves frequently.

**Raw SQL**

For actors using [raw SQLite](/actors/docs/sqlite), use `migrations` to apply numbered SQL steps in order. Give each schema its own migration table. RivetKit runs the returned `onMigrate` hook inside a SQLite savepoint, so the migration ladder is atomic:

### In-memory state (`c.state`)

If you use `c.state` for persistence, you are responsible for handling schema changes yourself. If you add, remove, or rename fields between versions, your code must handle the old shape gracefully.

**Manual defaults in `onWake`**

Apply defaults for missing fields:

**Zod schema coercion**

Use [Zod](https://zod.dev/) to parse persisted state on wake. Zod's `.default()` fills in missing fields automatically, so old actor state is coerced to the current schema:

For anything beyond simple defaults, consider moving to [SQLite](/actors/docs/sqlite) where you get proper migration tooling.

## Advanced

### How Version Upgrade Detection Works

When `drainOnVersionUpgrade` is enabled, Rivet uses two mechanisms to detect version changes:

- **New runner connection**: When a runner connects with a newer version number, the control plane immediately drains all older runners with the same name. This is the primary mechanism for [runner mode](/actors/docs/general/runtime-modes) deployments.
- **Metadata polling** (serverless only): In [serverless mode](/actors/docs/general/runtime-modes), runners periodically poll the control plane to check for newer versions and self-drain if one is found. This ensures old runners drain even if no new requests trigger a runner connection.

### SIGTERM Handling

When a runner process receives SIGTERM, it gracefully stops all actors before exiting:

- Each actor's `onSleep` hook is called, giving it time to save state
- Actors are rescheduled to other available runners
- The runner waits up to **30 minutes** for all actors to finish stopping
- If the process is force-killed before actors finish (e.g. SIGKILL), actors are rescheduled with a crash backoff penalty instead of a clean handoff

Actors have a maximum of 30 minutes to clean up during shutdown. Ensure your platform's drain grace period is at most 30 minutes.

### Shutdown Timeouts

Several timeouts control how long each part of the shutdown process can take:

| Timeout | Default | Description | Configuration |
|---------|---------|-------------|---------------|
| `actor_stop_threshold` | 30m | Engine-side limit on how long each actor has to stop before being marked lost | [Engine config](/actors/self-host/control-plane) (`pegboard.actor_stop_threshold`) |
| `sleepGracePeriod` | 15s | Total graceful sleep budget for `onSleep`, `waitUntil`, `keepAwake`, and async raw WebSocket handlers | [Actor options](/actors/docs/lifecycle#options) |
| `runner_lost_threshold` | 15s | Fallback detection if the runner dies without graceful shutdown | [Engine config](/actors/self-host/control-plane) (`pegboard.runner_lost_threshold`) |

Rivet has a max shutdown grace period of 30 minutes that cannot be configured.

## Related

- [Runtime Modes](/actors/docs/general/runtime-modes): Serverless vs runner deployment modes
- [Lifecycle](/actors/docs/lifecycle): Actor lifecycle hooks including `onSleep`