import { createServer } from "node:http";
import { actor, setup } from "rivetkit";

const counter = actor({
	state: { count: 0 },
	actions: {
		increment: (c, amount: number) => (c.state.count += amount),
	},
});

const registry = setup({
	startEngine: false,
	startServices: false,
	runtime: "native",
	use: { counter },
});

// Connect to the cluster as an actor node.
registry.start();

// Your app's HTTP server. The cluster's public URL forwards to PORT.
createServer((_req, res) => {
	res.end("ok");
}).listen(Number(process.env.PORT ?? 8080));

// Metrics, collected with your logs. Keep this server on localhost.
createServer(async (_req, res) => {
	const metrics = await registry.routes.prometheusMetrics();
	res.writeHead(metrics.status, Object.fromEntries(metrics.headers));
	res.end(await metrics.text());
}).listen(Number(process.env.RIVETKIT_METRICS_PORT ?? 9464), "127.0.0.1");
