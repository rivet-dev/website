import {
	faAws,
	faDocker,
	faHetzner,
	faKubernetes,
	faRailway,
	faRender,
	faRocket,
	faServer,
} from "@rivet-gg/icons";

export type Provider =
	| "docker-compose"
	| "kubernetes"
	| "vm"
	| "hetzner"
	| "aws-ecs"
	| "railway"
	| "render"
	| "custom";

/**
 * The two things a platform can host. A worker runs the user's code with the
 * Rivet SDK; the control plane routes, schedules, and persists.
 */
export type DeployRole = "worker" | "control-plane";

/**
 * Three-valued so a listing can rank platforms: Kubernetes is the
 * recommended home for both halves, the rest are supported.
 */
export type DeploySupport = "recommended" | "supported" | "unsupported";

export interface DeployOption {
	displayName: string;
	name: Provider;
	shortTitle?: string;
	/**
	 * Guide slug, not a URL. Deploy guides are per-product
	 * (`/{product}/self-host/{role}/{slug}`), so consumers build the href.
	 */
	slug: string;
	description: string;
	icon?: any;
	badge?: string;
	/** If true, this platform should NOT be shown for generic deploy guides for Node/Bun-specific platforms. */
	specializedPlatform?: boolean;
	/**
	 * Which halves this platform can host. Each control plane instance needs
	 * its own persistent block-storage disk and a stable private address.
	 */
	support: Record<DeployRole, DeploySupport>;
}

export const deployOptions: DeployOption[] = [
	{
		displayName: "Docker Compose",
		name: "docker-compose",
		shortTitle: "Compose",
		slug: "docker-compose",
		description: "Run Rivet with Docker Compose on a single host",
		icon: faDocker as any,
		support: { worker: "supported", "control-plane": "recommended" },
	},
	{
		displayName: "Kubernetes",
		name: "kubernetes",
		slug: "kubernetes",
		description: "Deploy to any Kubernetes cluster with container images",
		icon: faKubernetes as any,
		support: { worker: "supported", "control-plane": "recommended" },
	},
	{
		displayName: "Virtual Machine",
		name: "vm",
		shortTitle: "VM",
		slug: "vm",
		description:
			"Run on virtual machines or bare metal servers with full control",
		icon: faServer as any,
		support: { worker: "supported", "control-plane": "supported" },
	},
	{
		displayName: "Hetzner",
		name: "hetzner",
		slug: "hetzner",
		description:
			"Run on Hetzner Cloud servers with volumes and Object Storage",
		icon: faHetzner as any,
		support: { worker: "supported", "control-plane": "supported" },
	},
	{
		displayName: "AWS ECS",
		shortTitle: "AWS",
		name: "aws-ecs",
		slug: "aws-ecs",
		description:
			"Run containerized workloads on Amazon Elastic Container Service",
		icon: faAws as any,
		support: { worker: "supported", "control-plane": "supported" },
	},
	{
		displayName: "Railway",
		name: "railway",
		slug: "railway",
		description: "Deploy containers to Railway's managed infrastructure",
		icon: faRailway as any,
		support: { worker: "supported", "control-plane": "supported" },
	},
	{
		displayName: "Render",
		name: "render",
		slug: "render",
		description: "Deploy Rivet to Render with a persistent disk and automatic HTTPS",
		icon: faRender as any,
		support: { worker: "supported", "control-plane": "supported" },
	},
	{
		displayName: "Custom Platform",
		name: "custom",
		shortTitle: "Custom",
		slug: "custom",
		description:
			"Integrate Rivet with any other hosting platform of your choice",
		icon: faRocket as any,
		support: { worker: "supported", "control-plane": "supported" },
	},
];

export function deployOptionsForRole(role: DeployRole): DeployOption[] {
	return deployOptions.filter(
		(option) => option.support[role] !== "unsupported",
	);
}
