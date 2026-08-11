# Quickstart

Getting started with simple workflows, loops, and setup and teardown.

## Simple workflow

Use this when you need a short multi-step sequence.

## Loops

This is the recommended workflow shape for most actor workloads.

- Use a queue wait inside the loop to receive the next unit of work.
- Keep actor state changes in a single workflow loop.
- This gives you one durable workflow that manages all actor progress.

## Setup & teardown

Use this when the workflow should initialize resources, process queued commands, then clean up.