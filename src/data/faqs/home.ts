import type { FaqItem } from './types';

// FAQ content for the homepage. Rendered statically on pages/index.astro,
// which also emits it as FAQPage JSON-LD.
export const homeFaqs: FaqItem[] = [
	{
		question: 'Does Rivet have BYOC?',
		answerHtml:
			'Yes. Rivet deploys into your own cloud account, including air-gapped environments: the control plane and storage run inside your VPC while Rivet operates them. See the <a href="/docs/deploy/byoc/">BYOC docs</a>.',
	},
	{
		question: 'Does Rivet have a cloud?',
		answerHtml:
			'Yes. Rivet Cloud is fully managed. It can run your Actors for you on <a href="/docs/deploy/cloud/compute/">Rivet Compute</a>, with preview deployments and auto-scaling in edge regions, or you can <a href="/docs/deploy/self-host/workers/">bring your own worker</a> and run Actors on your compute while Rivet Cloud provides the control plane and routing layer.',
	},
	{
		question: 'Can I self-host Rivet?',
		answerHtml:
			'Yes. Rivet is fully self-hostable; see the <a href="/docs/deploy/self-host/control-plane/">self-hosting docs</a>. For enterprise support with a self-hosted deployment, <a href="/enterprise/">contact us</a>.',
	},
	{
		question: 'Is Rivet open-source?',
		answerHtml:
			'Yes. Rivet is open source under the permissive Apache 2.0 license. The source is on <a href="https://github.com/rivet-dev/actors">GitHub</a>.',
	},
	{
		question: 'How does Rivet compare to Kubernetes?',
		answerHtml:
			'Rivet is an orchestrator for stateful Actors. Think of an Actor like a pod, but much smaller, more lightweight, and faster to start. Each Actor also comes with SQLite for structured persistence, instead of or in addition to a filesystem, which gives it more flexibility than a Kubernetes pod.',
	},
	{
		question: 'How does Rivet compare to Cloudflare Durable Objects?',
		answerHtml:
			'Rivet is often used as an open-source alternative to Cloudflare Durable Objects that is easy to self-host and scales. It also fixes many of the constraints of Durable Objects: no 128 MB memory cap, no 10 GB SQLite limit, Actors are not randomly evicted, and you control the runtime because Actors run on vanilla Node.js or Bun instead of a custom runtime. Rivet also adds built-in connection handling, event broadcasting, durable scheduling and cron, full Vitest support, lifecycle hooks for draining, and control over Actor upgrades. See the <a href="/actors/compare/rivet-actors-vs-cloudflare-durable-objects/">Cloudflare Durable Objects comparison</a>.',
	},
	{
		question: 'Does Rivet use a custom V8 runtime?',
		answerHtml:
			'No. Rivet runs on native Node.js and Bun, so your existing packages, tooling, and tests work unchanged.',
	},
	{
		question: 'Does Rivet support Bun?',
		answerHtml: 'Yes. Rivet supports Bun in addition to Node.js.',
	},
	{
		question: 'Does Rivet support Effect?',
		answerHtml:
			'Yes. Rivet Actors work with Effect; see the <a href="https://github.com/rivet-dev/actors/tree/main/examples/ai-agent-effect">Effect agent example</a>.',
	},
	{
		question: 'Is Rivet like Erlang, Akka, or Orleans?',
		answerHtml:
			'Rivet implements the virtual actor pattern, which is closest to Orleans, but focuses on what modern workloads need: SQLite persistence instead of simple JSON stores, multi-region routing, and support for modern runtimes. Erlang and Akka do not provide virtual actors out of the box, though ecosystem packages exist that offer functionality comparable to Rivet Actors.',
	},
	{
		question: 'Does Rivet require microVMs, gVisor, or nested virtualization?',
		answerHtml:
			'No. Rivet only needs a standard process that connects to the control plane over WebSocket. That process can be Node.js, Bun, Rust, or anything else.',
	},
];
