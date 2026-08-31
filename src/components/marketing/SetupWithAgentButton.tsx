'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { INK_PANEL_LIGHT_BUTTON_CLASS, PRODUCT_HERO_PRIMARY_BUTTON_CLASS } from '@/components/marketing/typography';

// Firefox (and Chrome) only expose navigator.clipboard in secure contexts, so
// a page served over plain http on a LAN address has no clipboard API. Fall
// back to a hidden textarea + execCommand('copy'), which still works there.
async function copyText(text: string): Promise<boolean> {
	try {
		if (navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(text);
			return true;
		}
	} catch {
		// fall through to the legacy path
	}
	const textarea = document.createElement('textarea');
	textarea.value = text;
	textarea.setAttribute('readonly', '');
	textarea.style.position = 'fixed';
	textarea.style.top = '0';
	textarea.style.left = '0';
	textarea.style.opacity = '0';
	document.body.appendChild(textarea);
	textarea.select();
	let ok = false;
	try {
		ok = document.execCommand('copy');
	} catch {
		ok = false;
	}
	document.body.removeChild(textarea);
	return ok;
}

// "Set up with your agent": copies a ready-to-paste prompt for a coding agent.
// The accent variant is the hero's single ember; `light` is for ink panels.
// Shared by all four product pages so the affordance is identical everywhere.
export const SetupWithAgentButton = ({ prompt, variant = 'accent' }: { prompt: string; variant?: 'accent' | 'light' }) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		const ok = await copyText(prompt);
		if (!ok) return;
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<button
			type='button'
			onClick={handleCopy}
			aria-label={copied ? 'Agent setup prompt copied' : 'Set up with your agent'}
			className={variant === 'light' ? INK_PANEL_LIGHT_BUTTON_CLASS : PRODUCT_HERO_PRIMARY_BUTTON_CLASS}
		>
			{copied ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
			{/* Reserve the width of the longest label so the button doesn't shrink on copy */}
			<span className='grid place-items-center'>
				<span className='invisible col-start-1 row-start-1' aria-hidden='true'>
					Set up with your agent
				</span>
				<span className='col-start-1 row-start-1'>{copied ? 'Copied' : 'Set up with your agent'}</span>
			</span>
		</button>
	);
};
