# Node.js & Bun Quickstart

Get started with Rivet Actors in Node.js and Bun

Prefer to start from a complete project? See the runnable [`hello-world`](https://github.com/rivet-dev/rivet/tree/main/examples/hello-world) example.

## Steps

If you're using an AI coding assistant (like Claude Code, Cursor, Windsurf, etc.), add Rivet skills for enhanced development assistance:

```sh
npx skills add rivet-dev/skills
```

```sh
npm install rivetkit
```

Create a file with your actors, set up the registry, and start the server:

```sh Node.js
npx tsx --watch index.ts
```

```sh Bun
bun --watch index.ts
```

```sh Deno
deno run --allow-net --allow-read --allow-env --watch index.ts
```

Your server is now running on `http://localhost:6420`. Clients connect directly to the Rivet control plane on this port.

Visit [http://localhost:6420](http://localhost:6420) in your browser (or point your AI agent at it) to open the Rivet developer tools and inspect your actors live.

This code can run either in your frontend or within your backend:

See the [JavaScript client documentation](/actors/docs/clients/javascript) for more information.

See the [React documentation](/actors/docs/clients/react) for more information.

## Configuration Options