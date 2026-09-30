import { createClient } from "rivetkit/client";
import type { registry } from "./server";

const client = createClient<typeof registry>({
	endpoint: process.env.RIVET_ENDPOINT ?? "http://localhost:6420",
});
const reviewer = client.reviewer.getOrCreate(["pr-123"]);

const checkout = await reviewer.executeBash(
	"git clone https://github.com/acme/app . && git checkout pr-123",
	{ excludeFromContext: true },
);
if (checkout.exitCode !== 0) throw new Error(checkout.output);

await reviewer.prompt("Review the changes on this branch.");
console.log(await reviewer.getLastAssistantText());
