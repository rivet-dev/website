/**
 * The agentOS Registry as documentation: every catalog entry normalized to one
 * standard shape, which the `registry` content collection validates and the
 * docs pages render (src/pages/agentos/docs/registry/[...slug].astro).
 *
 * The catalog (`registry.ts`) has an entry kind per way of shipping: installable
 * packages, built-in config, docs-only adapters, and so on. The kind decides
 * what a reader needs (an install command, a setup snippet, a note), so that
 * decision is made once here and the pages only lay out the result.
 */
import { z } from "astro/zod";
import { AGENTOS_REGISTRY_CATEGORIES, type RegistryCategory } from "./registry-categories";
import { registry, registryCategoriesOf, type RegistryEntry } from "./registry";
import { registryCategoryHref } from "@/sitemap/registry";

export const registryDocSchema = z.object({
	slug: z.string(),
	title: z.string(),
	description: z.string(),
	/** Types of the registry groups listing it, in group order. */
	groups: z.array(z.string()).min(1),
	badge: z.enum(["Beta", "Coming Soon"]).optional(),
	icon: z.string().optional(),
	image: z.string().optional(),
	/** The facts row: category, status, package, docs. */
	details: z.array(
		z.object({
			label: z.string(),
			value: z.string(),
			href: z.string().optional(),
			code: z.boolean().optional(),
		}),
	),
	/** Shell command that installs it. */
	install: z.string().optional(),
	/** How to wire it into a VM. */
	setup: z
		.object({ title: z.string(), summary: z.string(), code: z.string() })
		.optional(),
	/** A closing sentence for entries with nothing to install or configure. */
	note: z.string().optional(),
	comingSoon: z.boolean(),
});

export type RegistryDoc = z.infer<typeof registryDocSchema>;

const TYPE_LABELS: Record<string, string> = {
	"file-system": "File System",
	binding: "Bindings",
	agent: "Agent",
	"sandbox-extension": "Sandbox Mounting",
	software: "Software",
	browser: "Browser",
	deploy: "Deploy",
};

const SANDBOX_INSTALL = "npm install @rivet-dev/agentos-core @rivet-dev/agentos-sandbox sandbox-agent";

function softwareExample(artifactName: string): string {
	return `import { AgentOs } from "@rivet-dev/agentos-core";

// Each release publishes registry packages next to a manifest. Use a release
// version, or \`latest\`.
const base = "https://releases.rivet.dev/agent-os/latest/software/";
const { artifacts } = await (await fetch(\`\${base}manifest.json\`)).json();
const pkg = artifacts.find((artifact) => artifact.name === "${artifactName}");

const vm = await AgentOs.create();

// The bytes are verified against the digest before the package's commands
// appear on /opt/agentos/bin.
await vm.software.install({
  type: "url",
  url: new URL(pkg.path, base).href,
  expectedDigest: pkg.digest,
});`;
}

function sandboxExample(provider: { slug: string; title: string } | null): string {
	const [importLine, comment, sandbox] = provider
		? [
				`import { ${provider.slug} } from "sandbox-agent/${provider.slug}";`,
				`// Start a ${provider.title}-backed sandbox and mount it into the VM`,
				`sandboxAgentProvider(${provider.slug}())`,
			]
		: [
				`import { docker } from "sandbox-agent/docker";`,
				"// Mount the sandbox filesystem and register its host functions in the VM",
				"sandboxAgentProvider(docker())",
			];
	return `import { AgentOs } from "@rivet-dev/agentos-core";
import { sandboxAgentProvider } from "@rivet-dev/agentos-sandbox";
${importLine}

${comment}
const vm = await AgentOs.create({
  sandbox: { provider: ${sandbox} },
});`;
}

/** What a reader does with an entry: install it, set it up, or read a note. */
function usage(entry: RegistryEntry): Pick<RegistryDoc, "install" | "setup" | "note"> {
	const isSoftware =
		entry.status === "available" &&
		(entry.types.includes("software") || entry.types.includes("browser"));
	const isSandboxExt = entry.status === "available" && entry.types.includes("sandbox-extension");
	const isBinding =
		entry.status === "available" && !isSoftware && !isSandboxExt && entry.types.includes("binding");

	switch (entry.status) {
		case "coming-soon":
		case "external":
			return {};
		case "docs":
			return { note: "Built into agentOS, with no separate install. See the docs for setup and usage." };
		case "config":
			return {
				setup: {
					title: "Configuration",
					summary: "Built into the SDK, with no separate install. Enable it in your VM config.",
					code: entry.configExample,
				},
			};
		case "available":
			if (isSoftware) {
				return {
					setup: {
						title: "Add to agentOS",
						summary:
							"Install the package's .aospkg release artifact into a VM so its commands are available inside the VM.",
						code: softwareExample(entry.artifactName ?? entry.slug),
					},
				};
			}
			if (isSandboxExt || isBinding) {
				return {
					install: SANDBOX_INSTALL,
					setup: {
						title: "Add to agentOS",
						summary: isSandboxExt
							? `Mount a ${entry.title} sandbox into the VM with @rivet-dev/agentos-sandbox.`
							: "Mount the sandbox filesystem and register its host functions with @rivet-dev/agentos-sandbox.",
						code: sandboxExample(isSandboxExt ? entry : null),
					},
				};
			}
			return entry.package ? { install: `npm install ${entry.package}` } : {};
	}
}

function toRegistryDoc(entry: RegistryEntry): RegistryDoc {
	const isSoftware =
		entry.status === "available" &&
		(entry.types.includes("software") || entry.types.includes("browser"));
	const isSandboxExt = entry.status === "available" && entry.types.includes("sandbox-extension");
	// An entry's own docsHref (always set for agents) wins; software and sandbox
	// mounting providers fall back to their type's docs page.
	const docsHref =
		entry.docsHref ??
		(isSoftware ? "/agentos/docs/software" : isSandboxExt ? "/agentos/docs/sandboxes" : undefined);
	const packageName = "package" in entry && entry.package ? entry.package : undefined;
	const status =
		entry.status === "coming-soon"
			? "Coming Soon"
			: entry.beta
				? "Beta"
				: entry.status === "available"
					? "Available"
					: "Built in";

	return {
		slug: entry.slug,
		title: entry.title,
		description: entry.description,
		groups: registryCategoriesOf(entry).map((category) => category.type),
		badge: entry.status === "coming-soon" ? "Coming Soon" : entry.beta ? "Beta" : undefined,
		icon: entry.icon,
		image: entry.image,
		details: [
			{ label: "Category", value: entry.types.map((type) => TYPE_LABELS[type] ?? type).join(", ") },
			{ label: "Status", value: status },
			...(packageName
				? [{ label: "Package", value: packageName, href: `https://www.npmjs.com/package/${packageName}`, code: true }]
				: []),
			...(docsHref ? [{ label: "Docs", value: "Guide", href: docsHref }] : []),
		],
		...usage(entry),
		comingSoon: entry.status === "coming-soon",
	};
}

/** Every entry the registry documents, in catalog order. Agents and deploy targets are in no group. */
export const registryDocs: RegistryDoc[] = registry
	.filter((entry) => registryCategoriesOf(entry).length > 0)
	.map(toRegistryDoc);

/** Link to an entry's section on a group's page. */
export function registryDocHref(productId: string, category: RegistryCategory, doc: RegistryDoc): string {
	return `${registryCategoryHref(productId, category)}#${doc.slug}`;
}

// ---------------------------------------------------------------------------
// Markdown mirror. The docs pages are Astro templates; `pnpm gen:markdown`
// publishes the same content as `.md` beside them (see metadata/docs-index.ts).
// ---------------------------------------------------------------------------

function docMarkdown(doc: RegistryDoc): string {
	const table = [
		`| ${doc.details.map((cell) => cell.label).join(" | ")} |`,
		`| ${doc.details.map(() => "---").join(" | ")} |`,
		`| ${doc.details
			.map((cell) => {
				const value = cell.code ? `\`${cell.value}\`` : cell.value;
				return cell.href ? `[${value}](${cell.href})` : value;
			})
			.join(" | ")} |`,
	].join("\n");
	return [
		`## ${doc.title}${doc.badge ? ` (${doc.badge})` : ""}`,
		doc.description,
		table,
		doc.comingSoon
			? "Coming soon. [Request an extension](https://github.com/rivet-dev/agentos/issues) to help us prioritize it."
			: undefined,
		doc.install ? `### Install\n\n\`\`\`sh\n${doc.install}\n\`\`\`` : undefined,
		doc.setup ? `### ${doc.setup.title}\n\n${doc.setup.summary}\n\n\`\`\`ts\n${doc.setup.code}\n\`\`\`` : undefined,
		doc.note,
	]
		.filter(Boolean)
		.join("\n\n");
}

/** A group page as Markdown: a section per entry. */
export function registryCategoryMarkdown(category: RegistryCategory): string {
	return registryDocs
		.filter((doc) => doc.groups.includes(category.type))
		.map(docMarkdown)
		.join("\n\n");
}

/** The overview as Markdown: a section per group listing its entries. */
export function registryOverviewMarkdown(productId: string): string {
	return AGENTOS_REGISTRY_CATEGORIES.map((category) => {
		const list = registryDocs
			.filter((doc) => doc.groups.includes(category.type))
			.map((doc) => `- [${doc.title}](${registryDocHref(productId, category, doc)}): ${doc.description}`)
			.join("\n");
		return `## ${category.label}\n\n${category.description}\n\n${list}`;
	}).join("\n\n");
}
