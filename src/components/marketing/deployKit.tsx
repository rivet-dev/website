'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import {
	CARD_TITLE_CLASS,
	PRIMARY_INK_BUTTON_CLASS,
	PRODUCT_HERO_SECONDARY_BUTTON_CLASS,
} from './typography';

// Shared deploy-option kit: the card, title, button pair, and terminal command
// block used wherever a page offers the "deploy it yourself vs Rivet Cloud"
// choice (home HostingSection, agentOS deploy section). One source so the two
// renditions cannot drift.

// Compact terminal command block, matching the hero copy-command chip: light
// porcelain fill with a hairline border, monospace, and an absolute copy
// button. Commands stay on one line and scroll horizontally rather than wrap.
export const DEPLOY_COMMAND_BLOCK_CLASS =
	'relative rounded-xl border border-ink/15 bg-white/55 p-3 pr-11 font-mono text-[11px] leading-relaxed text-ink-soft';

export const DEPLOY_CARD_CLASS =
	'relative flex h-full flex-col rounded-xl border border-ink/10 bg-white/55 p-6 md:p-8';
export const DEPLOY_CARD_TITLE_CLASS = CARD_TITLE_CLASS;
export const DEPLOY_BUTTON_BASE = 'w-full';
export const DEPLOY_GHOST_BUTTON_CLASS = `${PRODUCT_HERO_SECONDARY_BUTTON_CLASS} !w-full no-underline`;
export const DEPLOY_WHITE_BUTTON_CLASS = `${PRIMARY_INK_BUTTON_CLASS} !w-full no-underline`;

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
				className='absolute right-1.5 top-1.5 rounded p-1.5 text-ink-faint transition-colors motion-reduce:transition-none hover:bg-ink/10 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine'
			>
				{copied ? <Check className='h-4 w-4 text-pine' /> : <Copy className='h-4 w-4' />}
			</button>
		</div>
	);
};
