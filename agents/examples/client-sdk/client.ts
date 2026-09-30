import { createClient } from "rivetkit/client";
import type { registry } from "./actors";

export const client = createClient<typeof registry>({
	endpoint: process.env.RIVET_ENDPOINT ?? "http://localhost:6420",
});
