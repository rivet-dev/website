import { Octokit } from "@octokit/rest";
import { verify } from "@octokit/webhooks-methods";
import { Hono } from "hono";
import { createClient } from "rivetkit/client";
import type { registry } from "./server";

const secret = process.env.GITHUB_WEBHOOK_SECRET ?? "";
const botLogin = process.env.GITHUB_BOT_LOGIN ?? "";
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const client = createClient<typeof registry>();

export const github = new Hono();

github.post("/webhook", async (c) => {
	const body = await c.req.text();
	const signature = c.req.header("x-hub-signature-256") ?? "";
	if (!(await verify(secret, body, signature))) {
		return c.text("invalid signature", 401);
	}
	if (c.req.header("x-github-event") !== "issue_comment") return c.body(null, 202);

	const payload = JSON.parse(body);
	const comment = payload.comment;
	if (
		payload.action === "created" &&
		comment.user.login !== botLogin &&
		comment.body.includes(`@${botLogin}`)
	) {
		void replyToComment({
			owner: payload.repository.owner.login,
			repo: payload.repository.name,
			issueNumber: payload.issue.number,
			text: comment.body,
		}).catch((error) => console.error("github reply failed", error));
	}
	return c.body(null, 202);
});

async function replyToComment(comment: {
	owner: string;
	repo: string;
	issueNumber: number;
	text: string;
}): Promise<void> {
	const agent = client.agent.getOrCreate([comment.owner, comment.repo, String(comment.issueNumber)]);
	await agent.prompt(comment.text);
	const reply = await agent.getLastAssistantText();
	await octokit.rest.issues.createComment({
		owner: comment.owner,
		repo: comment.repo,
		issue_number: comment.issueNumber,
		body: reply || "I finished without a reply.",
	});
}
