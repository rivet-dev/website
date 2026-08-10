import { JsonSchemaPreview } from "@/components/JsonSchemaPreview";
import registryConfigSchema from "@/generated/artifacts/registry-config.json";

export function RegistryConfigSchema() {
	return (
		<JsonSchemaPreview
			schema={registryConfigSchema}
			empty={<p className="text-muted-foreground">No properties</p>}
		/>
	);
}
