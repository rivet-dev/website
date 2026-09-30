import { type FormEvent, useState } from "react";

type ComposerProps = {
	running: boolean;
	disabled: boolean;
	onSend: (text: string) => void;
	onStop: () => void;
};

export function Composer({ running, disabled, onSend, onStop }: ComposerProps) {
	const [text, setText] = useState("");

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const trimmed = text.trim();
		if (!trimmed) return;
		onSend(trimmed);
		setText("");
	}

	return (
		<form onSubmit={submit}>
			<input
				value={text}
				onChange={(event) => setText(event.target.value)}
				placeholder={running ? "Steer the agent…" : "Ask the agent…"}
			/>
			<button type="submit" disabled={disabled || !text.trim()}>
				{running ? "Steer" : "Send"}
			</button>
			{running && (
				<button type="button" onClick={onStop}>
					Stop
				</button>
			)}
		</form>
	);
}
