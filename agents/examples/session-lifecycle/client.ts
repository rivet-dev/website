import { createClient } from "rivetkit/client";
import type { registry } from "../pi/server";

const client = createClient<typeof registry>("http://localhost:6420");
const conn = client.agent.getOrCreate(["support", "customer-123"]).connect();

let steered = false;
conn.on("event", (event) => {
	if (event.type === "tool_execution_start" && !steered) {
		steered = true;
		void conn.steer("Keep the public API unchanged.");
	}
});

const cancel = setTimeout(() => void conn.abort(), 5 * 60_000);
await conn.prompt("Refactor the billing module.");
clearTimeout(cancel);

await conn.dispose();
