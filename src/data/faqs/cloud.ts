import type { FaqItem } from './types';

// FAQ content for the Rivet Cloud pricing page. Rendered by PricingPageClient
// and emitted as FAQPage JSON-LD from pages/pricing.astro. Keep numbers in sync
// with the plan and Actor Node size data in PricingPageClient.tsx.
export const cloudFaqs: FaqItem[] = [
	{
		question: 'What is a cluster?',
		answerHtml:
			'A cluster is a dedicated Rivet control plane for your Actors plus the Actor Nodes that run them, hosted on Google Cloud in the region you choose. Your plan sets how many control plane nodes it runs, how many Actor Nodes it can have, and its support. You can change the plan and your Actor Nodes later without downtime.',
	},
	{
		question: 'What are Actor Nodes?',
		answerHtml:
			'Actor Nodes connect to the control plane and run your actor logic. Scale them with the number of actors running. Each node is priced per month by its size: R-5 (1/4 vCPU, 1 GB) is $4.20, R-10 (1/2 vCPU, 2 GB) is $8.40, R-20 (1 vCPU, 4 GB) is $16.80, R-40 (4 vCPU, 8 GB) is $27.30, and R-160 (8 vCPU, 16 GB) is $94.50. R-20 requires the Hobby plan or higher; R-40 and R-160 require Team or higher.',
	},
	{
		question: 'What does the free plan include?',
		answerHtml:
			'The free plan includes one control plane node in one availability zone, up to 1 Actor Node at no charge (R-5 or R-10), and community support. It is designed for prototyping.',
	},
	{
		question: 'How is a cluster priced?',
		answerHtml:
			'Your monthly cost is the control plane price for your plan plus your Actor Nodes. Hobby is $10 per month with one control plane node and up to 3 Actor Nodes; Team is $120 per month with three control plane nodes across three availability zones and up to 10 Actor Nodes; Enterprise is $900 per month with five control plane nodes across three availability zones and up to 50 Actor Nodes. For example, a Team cluster with one R-5 Actor Node is $120 + $4.20 = $124.20 per month. Need more Actor Nodes? <a href="https://rivet.dev/talk-to-an-engineer/">Contact sales</a>.',
	},
	{
		question: 'Do I pay for running my Actors?',
		answerHtml:
			'Only through the Actor Nodes in your cluster. Bring your own nodes on Vercel, Railway, AWS, Kubernetes, or bare metal and connect them to your cluster at no extra cost beyond the control plane.',
	},
	{
		question: 'Is Rivet free to self-host?',
		answerHtml:
			'Yes. Rivet is open source under the Apache 2.0 license and free to run on your own infrastructure with no usage limits. It ships as a single Rust binary or Docker image. See the <a href="https://rivet.dev/docs/deploy/self-host/control-plane/">self-hosting docs</a> to get started, or use Rivet Cloud if you prefer managed infrastructure.',
	},
	{
		question: 'Can Rivet run in my VPC, on-prem, or air-gapped?',
		answerHtml:
			'Yes. The open-source release runs in your VPC, on-prem, or fully air-gapped with no usage limits. The control plane is one stateless binary that stores Actor data in a bucket you own, on S3, Google Cloud Storage, Azure Blob Storage, or any S3-compatible store. For production deployments in regulated networks, the Enterprise Edition adds hardening guidance and priority support. <a href="https://rivet.dev/talk-to-an-engineer/">Contact sales</a> for details.',
	},
	{
		question: 'What support is included with each plan?',
		answerHtml:
			'The free plan includes community support through Discord and GitHub. Hobby includes email support, Team includes Slack and email support, and Enterprise includes dedicated support.',
	},
	{
		question: 'Do you offer discounts for startups or high-volume usage?',
		answerHtml:
			'Yes. New Rivet Cloud customers from Y Combinator or a16z Speedrun, including alumni, get 50% off the Team plan for 12 months through our <a href="https://rivet.dev/startups/">startup deal</a>. For larger clusters or high-volume workloads, <a href="https://rivet.dev/talk-to-an-engineer/">contact sales</a> for a custom quote.',
	},
];
