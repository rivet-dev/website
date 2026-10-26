// Single source of truth for agentOS deploy targets. Consumed by the docs
// <DeployTargets /> component and by the registry page's Deploy section, so
// adding a target here updates both.
export interface DeployTarget {
	slug: string;
	title: string;
	// External deployment guide on rivet.dev.
	href: string;
	description: string;
	image: string;
}

export const DEPLOY_TARGETS: DeployTarget[] = [
	{
		slug: "rivet-compute",
		title: "Rivet Compute",
		href: "https://rivet.dev/docs/deploy/cloud/compute/",
		description: "Fully managed, zero-ops deployment on Rivet Cloud.",
		image: "/images/registry/deploy-rivet-compute.svg",
	},
	{
		slug: "railway",
		title: "Railway",
		href: "https://rivet.dev/docs/deploy/self-host/nodes/railway/",
		description: "Deploy agentOS on Railway's cloud infrastructure.",
		image: "/images/registry/deploy-railway.svg",
	},
	{
		slug: "kubernetes",
		title: "Kubernetes",
		href: "https://rivet.dev/docs/deploy/self-host/nodes/kubernetes/",
		description: "Self-host agentOS on your Kubernetes cluster.",
		image: "/images/registry/deploy-kubernetes.svg",
	},
	{
		slug: "aws-ecs",
		title: "AWS ECS",
		href: "https://rivet.dev/docs/deploy/self-host/nodes/aws-ecs/",
		description: "Deploy agentOS on AWS Elastic Container Service.",
		image: "/images/registry/deploy-aws-ecs.svg",
	},
	{
		slug: "hetzner",
		title: "Hetzner",
		href: "https://rivet.dev/docs/deploy/self-host/nodes/hetzner/",
		description: "Self-host agentOS on Hetzner servers.",
		image: "/images/registry/deploy-hetzner.svg",
	},
	{
		slug: "vm-and-bare-metal",
		title: "VM & Bare Metal",
		href: "https://rivet.dev/docs/deploy/self-host/nodes/vm/",
		description: "Run agentOS on your own VMs or bare-metal machines.",
		image: "/images/registry/deploy-vm-and-bare-metal.svg",
	},
	{
		slug: "custom",
		title: "Custom Platform",
		href: "https://rivet.dev/docs/deploy/self-host/nodes/custom/",
		description: "Bring agentOS to any platform that runs containers or Node.js.",
		image: "/images/registry/deploy-custom.svg",
	},
];
