# Dynamic Apps

Deploy user-generated applications in agentOS VMs.

agentOS Apps runs user-generated HTTP applications on Rivet. Apps can add
durable SQLite state, workflows, multiplayer and realtime state, queues, and
cron jobs.

agentOS Apps is in preview and its API is subject to change.

## Architecture

**agentOS Apps is a library, not a hosted AI-generated app deployment
platform.** Unlike managed platforms, you can deploy it anywhere and customize
the server, routing, authentication, and deployment flow.

Requests reach your Hono server, where `appsRouter` routes them to a prewarmed
agentOS VM serving the generated application. Rivet handles request routing and
orchestrates the pool of prewarmed VMs.

      <text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-family="var(--sl-font)" font-weight="700" font-size="38" fill="#1b1916">OS</text>

  <text x="75" y="91" text-anchor="middle" font-family="var(--sl-font)" font-size="14" font-weight="600" fill="#1b1916">Request</text>
  <text x="75" y="110" text-anchor="middle" font-family="var(--sl-font)" font-size="10.5" fill="#56524a">Agent · Browser · API</text>

  <text x="206" y="65" font-family="var(--sl-font)" font-size="13" font-weight="600" fill="#1b1916">Your Hono server</text>
  <text x="277" y="99" text-anchor="middle" font-family="var(--sl-font)" font-size="12" font-weight="600" fill="#1b1916">appsRouter</text>
  <text x="277" y="116" text-anchor="middle" font-family="var(--sl-font)" font-size="10" fill="#56524a">route the request</text>

  <text x="388" y="82" text-anchor="middle" font-family="var(--sl-font)" font-size="10" fill="#56524a">Rivet</text>

  <text x="432" y="65" font-family="var(--sl-font)" font-size="13" font-weight="600" fill="#1b1916">Prewarmed VM</text>
  <text x="485" y="99" font-family="var(--sl-font)" font-size="11.5" font-weight="600" fill="#1b1916">AI-generated app</text>
  <text x="485" y="116" font-family="var(--sl-font)" font-size="10" fill="#56524a">serves the response</text>