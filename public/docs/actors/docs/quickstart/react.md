# React Quickstart

Build realtime React applications with Rivet Actors

## Steps

If you're using an AI coding assistant (like Claude Code, Cursor, Windsurf, etc.), add Rivet skills for enhanced development assistance:

```sh
npx skills add rivet-dev/skills
```

```sh
npm install rivetkit @rivetkit/react
```

Create your actor registry on the backend and start the server:

Set up your React application:

For detailed information about the React client API, see the [React Client API Reference](/actors/docs/clients/react).

Configure Vite for development:

```ts vite.config.ts @nocheck
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
})
```

Start both the backend and frontend:

**Terminal 1**: Start the backend

```sh Node.js
npx tsx --watch backend/index.ts
```

```sh Bun
bun --watch backend/index.ts
```

```sh Deno
deno run --allow-net --allow-read --allow-env --watch backend/index.ts
```

**Terminal 2**: Start the frontend

```sh Frontend
npx vite
```

Open `http://localhost:5173` in your browser. Try opening multiple tabs to see realtime sync in action.

Visit [http://localhost:6420](http://localhost:6420) in your browser (or point your AI agent at it) to open the Rivet developer tools and inspect your actors live.

## Configuration Options