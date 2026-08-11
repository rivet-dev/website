# Quickstart

Set up the server, deploy an AI-generated app, and visit it.

[View the complete Quickstart example on GitHub](https://github.com/rivet-dev/agentos/tree/main/examples/apps-hello-world).

```sh
npm add @rivet-dev/agentos @rivet-dev/agentos-apps
npm add @hono/node-server hono
npm add --save-dev tsx
npm pkg set type=module
```

Setup the HTTP server that will serve requests for AI-generated apps. Also set
up the actors that power the deployments.

Run the server:

```sh
npx tsx src/server.ts
```

Pass generated files directly to `deployApp()`. This can be called by an agent,
an upload endpoint, or any other part of your system:

```sh
npx tsx src/deploy.ts
```

Open `http://localhost:3000/apps/hello-world/`. Pass this URL to agents,
frontends, or any other part of your system that needs to visit the deployment.

Deploy the host server to any supported target:

See [Deployment](/agentos/docs/deployment) for managed and self-hosted options.