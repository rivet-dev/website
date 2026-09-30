import { pi } from "@rivet-dev/pi";
import { agentOSProvider } from "@rivet-dev/sandbox-adapter/agentos";
import { Hono } from "hono";
import { setup } from "rivetkit";
import { slack } from "./slack";

const coreutils = {
	url: "https://unpkg.com/@agentos-software/coreutils@0.3.5/dist/package.aospkg",
	digest: "sha256:a291a48ce90b0ad12d3937e771d9aaec37b289c1f5b047fe3d1d61151dbeee51",
};

const agent = pi({
	model: "anthropic/claude-opus-5-5",
	sandbox: agentOSProvider({ software: [coreutils] }),
});

export const registry = setup({ use: { agent } });

const app = new Hono();
app.all("/api/rivet/*", (c) => registry.handler(c.req.raw));
app.route("/slack", slack);

export default app;
