import { pi } from "@rivet-dev/pi";
import { agentOSProvider } from "@rivet-dev/sandbox-adapter/agentos";
import { Hono } from "hono";
import { setup } from "rivetkit";
import { linearRoutes } from "./linear";

const agent = pi({
	model: "anthropic/claude-opus-5-5",
	sandbox: agentOSProvider(),
});

export const registry = setup({ use: { agent } });

const app = new Hono();
app.all("/api/rivet/*", (c) => registry.handler(c.req.raw));
app.route("/linear", linearRoutes);

export default app;
