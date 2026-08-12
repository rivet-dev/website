'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

// Shared deploy-option kit: the card, title, button pair, and terminal command
// block used wherever a page offers the "deploy it yourself vs Rivet Cloud"
// choice (home HostingSection, agentOS deploy section). One source so the two
// renditions cannot drift.

// Compact terminal command block, matching the command blocks on the cookbook
// pages: flat ink with a hairline border, monospace, and an absolute copy
// button. Commands stay on one line and scroll horizontally rather than wrap.
export const DEPLOY_COMMAND_BLOCK_CLASS =
	'selection-paper relative rounded-md border border-ink/20 bg-ink p-3 pr-11 font-mono text-[11px] leading-relaxed text-cream/85';

export const DEPLOY_CARD_CLASS =
	'relative flex h-full flex-col border border-ink/10 bg-white/55 p-6 md:p-8';
export const DEPLOY_CARD_TITLE_CLASS = 'text-base font-medium tracking-tight text-ink';
export const DEPLOY_BUTTON_BASE =
	'inline-flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 text-sm font-medium transition-colors';
export const DEPLOY_GHOST_BUTTON_CLASS = `${DEPLOY_BUTTON_BASE} border border-ink/15 bg-white/55 text-ink-soft hover:border-ink/30 hover:bg-white hover:text-ink`;
export const DEPLOY_WHITE_BUTTON_CLASS = `${DEPLOY_BUTTON_BASE} border border-ink/15 bg-white text-ink hover:border-ink/30`;

// Terminal command block. Mirrors the cookbook command-block markup: a
// horizontally-scrollable single-line command with an absolute copy button.
export const TerminalCommand = ({ command }: { command: string }) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(command);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error('Failed to copy command:', err);
		}
	};

	return (
		<div className={DEPLOY_COMMAND_BLOCK_CLASS}>
			<div className='scrollbar-hide overflow-x-auto'>
				<code className='select-all whitespace-nowrap'>{command}</code>
			</div>
			<button
				type='button'
				onClick={handleCopy}
				aria-label={copied ? 'Copied' : 'Copy command'}
				className='absolute right-1.5 top-1.5 rounded p-1.5 text-cream/50 transition-colors hover:bg-cream/10 hover:text-cream'
			>
				{copied ? <Check className='h-4 w-4 text-sage' /> : <Copy className='h-4 w-4' />}
			</button>
		</div>
	);
};
