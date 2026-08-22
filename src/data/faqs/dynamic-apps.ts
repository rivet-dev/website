import type { FaqItem } from "./types";

// Shared by the visible Dynamic Apps FAQ and its FAQPage JSON-LD. Keep claims
// aligned with the product docs; in particular, a failed build never replaces
// the active release, and the library is not a hosted platform.
export const dynamicAppsFaqs: FaqItem[] = [
  {
    question: "What is Dynamic Apps?",
    answerHtml:
      'A library for deploying AI-generated applications on Rivet, not a hosted platform. An agent generates the files, deployApp() builds and releases them, and your own Hono server routes requests to each app. See the <a href="https://rivet.dev/dynamic-apps/docs/">Dynamic Apps docs</a>.',
  },
  {
    question: "What can a generated app contain?",
    answerHtml:
      'Full HTTP backends and frontends, durable SQLite data, workflows, multiplayer and realtime state, queues, and cron jobs. A directory with an index.html is served as a static site. See <a href="https://rivet.dev/dynamic-apps/docs/state-and-data/">State and data</a>.',
  },
  {
    question: "What happens when a generated build fails?",
    answerHtml:
      'deployApp() throws with TypeScript build diagnostics an agent can use to repair the files and deploy again. A failed build never replaces the active release. See <a href="https://rivet.dev/dynamic-apps/docs/deploy/">Deploying apps</a>.',
  },
  {
    question: "How do I authenticate requests to deployed apps?",
    answerHtml:
      'With ordinary Hono middleware registered before the apps router. Anything that works on a Hono server works here. See <a href="https://rivet.dev/dynamic-apps/docs/authentication/">Authentication</a>.',
  },
  {
    question: "Do I need agentOS or Workflows?",
    answerHtml:
      'Apps run in <a href="https://rivet.dev/agentos/">agentOS</a> VMs, and the packages install together. <a href="https://rivet.dev/workflows/">Workflows</a> is optional; add it when a generated app runs durable multi-step jobs.',
  },
  {
    question: "What does an idle app cost?",
    answerHtml:
      'Nothing while idle. Apps scale to zero by default and wake on the next request. A running app takes 22 MB of memory. See <a href="https://rivet.dev/dynamic-apps/docs/deploy/">Deploying apps</a> for scaling options.',
  },
  {
    question: "Is Dynamic Apps open source?",
    answerHtml:
      'Yes, Apache 2.0, as part of agentOS. Read the <a href="https://github.com/rivet-dev/agentos">source on GitHub</a> or start from the <a href="https://github.com/rivet-dev/agentos/tree/main/examples/apps-ai-builder">AI App Builder example</a>.',
  },
];
