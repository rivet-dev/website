import { JsonSchemaPreview } from "@/components/JsonSchemaPreview";
import actorConfigSchema from "@/generated/artifacts/actor-config.json";

export function ActorConfigSchema() {
	return (
		<JsonSchemaPreview
			schema={actorConfigSchema}
			empty={<p className="text-muted-foreground">No properties</p>}
		/>
	);
}
