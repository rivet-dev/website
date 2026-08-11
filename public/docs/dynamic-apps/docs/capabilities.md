# Add Capabilities to Apps

Apps with durable SQLite data, workflows, multiplayer state, queues, and scheduled jobs.

Agents can generate more than pages and REST APIs. These examples show apps
with durable SQLite data, workflows, multiplayer state, queues, and scheduled
jobs. The server snippets represent AI-generated app code; the client snippets
show how another part of your system connects to it.

## SQLite

Example AI-generated app code that stores durable data in an actor-owned SQLite
database. [View the complete SQLite example](https://github.com/rivet-dev/agentos/tree/main/examples/apps-sqlite).

## Workflows

Example AI-generated app code that runs durable multi-step jobs that can sleep
and resume. [View the complete workflows example](https://github.com/rivet-dev/agentos/tree/main/examples/apps-workflows).

## Multiplayer

Example AI-generated app code that shares realtime state between clients.
[View the complete multiplayer example](https://github.com/rivet-dev/agentos/tree/main/examples/apps-multiplayer).

## Queues

AI-generated apps can use actor queues for durable background work and ordered
processing.

## Cron jobs

AI-generated apps can schedule recurring work from an actor. See
[Cron Jobs](/agentos/docs/cron).

These capabilities use RivetKit and its ordinary DirectActor client. agentOS
Apps does not wrap the client.