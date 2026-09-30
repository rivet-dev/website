import { createRivetKit } from "@rivetkit/react";
import type { registry } from "../pi/server";

export const { useActor } = createRivetKit<typeof registry>("http://localhost:6420");
