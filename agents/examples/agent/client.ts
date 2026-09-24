import { createClient } from "rivetkit/client";
import type { registry } from "./index";

const client = createClient<typeof registry>("http://localhost:6420");

const agent = client.agent.getOrCreate(["agent-123"]).connect();
agent.on("token", (delta: string) => process.stdout.write(delta));
await agent.queue.send("message", { text: "hello!" });
