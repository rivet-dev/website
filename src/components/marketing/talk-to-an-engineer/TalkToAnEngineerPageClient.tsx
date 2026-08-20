import { TalkToAnEngineerForm } from "./form";
import { HERO_H1_CLASS } from "../typography";

export default function TalkToAnEngineerPageClient() {
	return (
		<main id="main-content" tabIndex={-1} className="paper-grain min-h-screen w-full bg-paper font-sans text-ink-soft">
			<div className="depth-wash relative overflow-hidden pb-16 pt-32 md:pb-24 md:pt-48">
				<div className="mx-auto max-w-md px-6">
					<h1 className={`mb-4 text-center ${HERO_H1_CLASS}`}>
						Talk to an Engineer
					</h1>
					<p className="mb-10 text-base leading-relaxed text-ink-soft text-center md:text-lg">
						Connect with one of our engineers to discuss your
						technical needs and how Rivet can help.
					</p>
					<div className="rounded-2xl border border-ink/10 bg-white/55 p-6 sm:p-8">
						<TalkToAnEngineerForm />
					</div>
				</div>
			</div>
		</main>
	);
}
