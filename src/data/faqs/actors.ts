import type { FaqItem } from './types';

// FAQ content for the Rivet Actors marketing page. Rendered statically on
// pages/actors.astro and emitted as FAQPage JSON-LD from the same page.
export const actorsFaqs: FaqItem[] = [
	{
		question: 'What is a Rivet Actor?',
		answerHtml:
			'A Rivet Actor is a long-lived, stateful process that keeps its identity and state between requests. It can continue working beyond a single request and sleep while idle. The common pattern is one Actor per agent, session, or user, with state, storage, queues, and realtime connections included. See the <a href="https://rivet.dev/actors/docs/">Rivet Actors docs</a> for details.',
	},
	{
		question: 'How are Rivet Actors different from serverless functions?',
		answerHtml:
			'Serverless functions are usually stateless and bounded to individual invocations. A Rivet Actor remembers state between requests, holds WebSocket connections, and can keep working while active. It can sleep when idle and wake for a request, message, or schedule.',
	},
	{
		question: 'Do I need a separate database for actor state?',
		answerHtml:
			'No. State can stay co-located with the Actor, avoiding a network round trip for local reads. Use <a href="https://rivet.dev/actors/docs/state/">in-memory state</a> for small values and each Actor\'s built-in SQLite database for relational or queryable data. State is persisted so it can be restored after restarts and deployments. You can still connect to an external database when you need one.',
	},
	{
		question: 'How do Rivet Actors compare to Cloudflare Durable Objects?',
		answerHtml:
			'Cloudflare Durable Objects provide a stateful serverless primitive tied to the Cloudflare platform. Rivet Actors provide an Apache-licensed Actor model available through Rivet Cloud or as a self-hosted deployment. See the full <a href="https://rivet.dev/actors/compare/rivet-actors-vs-cloudflare-durable-objects/">Rivet Actors vs Cloudflare Durable Objects comparison</a>.',
	},
	{
		question: 'What happens when an actor is idle?',
		answerHtml:
			'Actors can sleep after a period of inactivity to release active resources. Their state is persisted, and they wake on demand when a request, message, or scheduled alarm arrives. See the <a href="https://rivet.dev/actors/docs/lifecycle/">lifecycle docs</a> for how sleeping works.',
	},
	{
		question: 'How do Rivet Actors scale?',
		answerHtml:
			'The core pattern is one Actor per entity in your system: a user, document, chat room, or agent. Actors are independent and scheduled separately. Capacity and startup behavior depend on the deployment and control-plane topology you choose.',
	},
	{
		question: 'Do Rivet Actors support WebSockets and realtime updates?',
		answerHtml:
			'Yes. Realtime is built in. Clients call actions to send data to an actor, and the actor pushes updates back over WebSockets with <a href="https://rivet.dev/actors/docs/events/">events</a>, either to specific connections or broadcast to all of them. There is no external pub/sub system or polling to manage.',
	},
	{
		question: 'What languages and frameworks can I use?',
		answerHtml:
			'Rivet Actors are written in TypeScript or JavaScript and run on Node.js, Bun, and Deno, with a Rust SDK available in preview. Quickstarts cover <a href="https://rivet.dev/actors/docs/">backend, React, Next.js, and Rust</a> apps. Client libraries are available for JavaScript, React, and Swift.',
	},
];
