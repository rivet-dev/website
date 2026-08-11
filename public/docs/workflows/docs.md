# Introduction

Build durable, replayable run loops in Rivet Actors with steps, queue waits, timers, and rollback.

Use workflows for durable, multi-step execution with replay safety.

## What are workflows?

A workflow is a durable, replayable run handler for a Rivet Actor.

- Survives restarts: workflow progress is saved automatically.
- Re-runs safely: replay follows the same recorded steps.
- Event-driven: workflows can pause for queue messages, then continue.