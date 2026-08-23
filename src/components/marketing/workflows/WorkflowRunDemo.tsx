"use client";

import {
  Check,
  CircleDot,
  GitPullRequestArrow,
  Play,
  RotateCcw,
  ShieldCheck,
  TestTubeDiagonal,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";

type RunStage = {
  label: string;
  detail: string;
  status: "Active" | "Complete" | "Pending" | "Retrying" | "Reused" | "Waiting";
  icon: typeof CircleDot;
};

const stageBase = [
  { label: "Issue received", icon: GitPullRequestArrow },
  { label: "Agent edits repository", icon: CircleDot },
  { label: "Run test suite", icon: TestTubeDiagonal },
  { label: "Wait for approval", icon: ShieldCheck },
  { label: "Record result", icon: Check },
] as const;

const STATUS_CLASS: Record<RunStage["status"], string> = {
  Active: "border-pine/30 bg-pine/[0.06] text-pine",
  Complete: "border-pine/30 bg-pine/[0.06] text-pine",
  Pending: "border-ink/10 bg-ink/[0.02] text-ink-faint",
  Retrying: "border-ink/15 bg-paper-mid/70 text-ink-soft",
  Reused: "border-pine/30 bg-pine/[0.06] text-pine",
  Waiting: "border-ink/15 bg-paper-mid/70 text-ink-soft",
};

function stageState(
  index: number,
  phase: number,
  restarted: boolean,
): RunStage {
  const base = stageBase[index];

  if (restarted && index < 3) {
    return {
      ...base,
      status: "Reused",
      detail: "Recorded result reused after restart",
    };
  }

  if (index < phase) {
    const detail =
      [
        "Webhook input recorded",
        "Patch output recorded",
        "Passed on attempt 2",
        "Approval message recorded",
      ][index] ?? "Completion recorded";
    return { ...base, status: "Complete", detail };
  }

  if (index === phase) {
    if (index === 2) {
      return {
        ...base,
        status: "Retrying",
        detail: "Attempt 1 failed · retrying with the same input",
      };
    }
    if (index === 3) {
      return {
        ...base,
        status: "Waiting",
        detail: restarted
          ? "Resumed here · waiting for a queue message"
          : "Waiting for a queue message",
      };
    }
    if (index === 4) {
      return { ...base, status: "Complete", detail: "Workflow complete" };
    }
    return {
      ...base,
      status: "Active",
      detail:
        index === 0
          ? "Recording event input"
          : "Writing and validating a patch",
    };
  }

  return { ...base, status: "Pending", detail: "Not started" };
}

export function WorkflowRunDemo() {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState(0);
  const [restarted, setRestarted] = useState(false);
  const [manual, setManual] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const visiblePhase = reduceMotion && !manual ? 3 : phase;

  useEffect(() => {
    if (manual) return;
    if (reduceMotion) {
      setPhase(3);
      return;
    }

    const timers = [
      window.setTimeout(() => setPhase(1), 700),
      window.setTimeout(() => setPhase(2), 1_500),
      window.setTimeout(() => setPhase(3), 2_700),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [manual, reduceMotion, runKey]);

  const stages = useMemo(
    () =>
      stageBase.map((_, index) => stageState(index, visiblePhase, restarted)),
    [visiblePhase, restarted],
  );

  const simulateRestart = () => {
    setManual(true);
    setRestarted(true);
    // The first three operations already have recorded results. Replaying that
    // history after a restart reaches the outstanding approval wait.
    setPhase(3);
  };

  const approve = () => {
    if (visiblePhase !== 3) return;
    setManual(true);
    setPhase(4);
  };

  const replay = () => {
    setRestarted(false);
    setManual(false);
    setPhase(0);
    setRunKey((value) => value + 1);
  };

  const announcement =
    visiblePhase === 4
      ? "Workflow complete. The approval and final result are recorded."
      : restarted
        ? "Restart simulated. Three recorded results were reused. The workflow resumed at approval."
        : visiblePhase === 3
          ? "Workflow is waiting for approval."
          : visiblePhase === 2
            ? "Tests failed once and are retrying."
            : "Workflow is running.";

  return (
    <div className="overflow-hidden rounded-xl border border-ink/10 bg-white/55 text-ink">
      <div className="flex items-center gap-2 border-b border-ink/10 px-4 py-3">
        <span aria-hidden className="h-3 w-3 rounded-full bg-ink/10" />
        <span aria-hidden className="h-3 w-3 rounded-full bg-ink/10" />
        <span aria-hidden className="h-3 w-3 rounded-full bg-ink/10" />
        <p className="ml-2 hidden text-xs font-medium text-ink sm:inline">bug-fix / issue-482</p>
        <p className="ml-auto font-mono text-[11px] text-ink-faint">run_01JQ6R8T</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_15rem]">
        <ol
          className="divide-y divide-ink/10 px-4 py-2 sm:px-6"
          aria-label="Workflow steps"
        >
          {stages.map((stage, index) => {
            const StageIcon = stage.icon;
            return (
              <li
                key={stage.label}
                className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 py-4"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/10 bg-paper text-ink-soft">
                  <StageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{stage.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-faint">
                    {stage.detail}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-2 py-1 text-[11px] font-medium ${STATUS_CLASS[stage.status]}`}
                >
                  {stage.status}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="workflow-demo-controls border-t border-ink/10 bg-paper-mid/60 p-5 lg:border-l lg:border-t-0">
          <div className="rounded-md border border-ink/10 bg-white/55 p-3">
            <p
              aria-live="polite"
              className="text-xs leading-relaxed text-ink-soft"
            >
              {announcement}
            </p>
          </div>
          <div className="mt-5 flex flex-col gap-2">
            <button
              type="button"
              onClick={simulateRestart}
              disabled={visiblePhase !== 3}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-ink/15 bg-white/55 px-3 py-2 text-xs font-medium text-ink-soft transition-colors hover:border-ink/30 hover:bg-white hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine disabled:cursor-not-allowed disabled:opacity-35"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Simulate restart
            </button>
            <button
              type="button"
              onClick={approve}
              disabled={visiblePhase !== 3}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-ink bg-ink px-3 py-2 text-xs font-medium text-cream transition-colors hover:bg-ink/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine disabled:cursor-not-allowed disabled:border-ink/10 disabled:bg-ink/5 disabled:text-ink-faint"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Approve
            </button>
            <button
              type="button"
              onClick={replay}
              className="inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-ink-soft transition-colors hover:bg-white/55 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine"
            >
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              Replay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
