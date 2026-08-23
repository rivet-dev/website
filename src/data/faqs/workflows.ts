import type { FaqItem } from "./types";

// Shared by the visible Workflows FAQ and its FAQPage JSON-LD. Keep claims in
// this file aligned with the product docs; in particular, Workflows does not
// promise exactly-once side effects or automatic recovery from terminal errors.
export const workflowsFaqs: FaqItem[] = [
  {
    question: "What is a Rivet Workflow?",
    answerHtml:
      'An <a href="https://rivet.dev/actors/docs/">Actor</a> run handler wrapped in workflow(). Each ctx.step() records its result, so a run resumes after restarts and deployments.',
  },
  {
    question: "Does Workflows guarantee exactly-once execution?",
    answerHtml:
      'No. Completed step results are reused on replay, but a step can be attempted again if a crash lands after its side effect and before its result is recorded. Make external side effects idempotent. See <a href="https://rivet.dev/workflows/docs/steps/">Steps</a>.',
  },
  {
    question: "Can a workflow wait for human approval?",
    answerHtml:
      'Yes. A run waits durably on a queue message and branches on the decision your application sends. See <a href="https://rivet.dev/workflows/docs/queues/">Queues</a>.',
  },
  {
    question: "What happens when a step fails?",
    answerHtml:
      'Transient failures retry per the step\'s retry and timeout policy. Terminal failures stay visible in the inspector, where eligible steps can be replayed after a fix. See <a href="https://rivet.dev/workflows/docs/failure-and-recovery/">Failure and recovery</a>.',
  },
  {
    question: "Do I need agentOS or Dynamic Apps?",
    answerHtml:
      'No. Workflows runs on Actors alone. Add <a href="https://rivet.dev/agentos/">agentOS</a> when an agent needs a computer, or <a href="https://rivet.dev/dynamic-apps/">Dynamic Apps</a> when the work should ship an application.',
  },
  {
    question: "Is Rivet Workflows open source?",
    answerHtml:
      'Yes, Apache 2.0. Read the <a href="https://github.com/rivet-dev/rivet/tree/main/rivetkit-typescript/packages/rivetkit/src/workflow">implementation on GitHub</a>.',
  },
];
