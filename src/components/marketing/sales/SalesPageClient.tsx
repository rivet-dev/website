import { SalesForm } from "./form";
import { HERO_H1_CLASS } from "../typography";

export default function SalesPageClient() {
	return (
		<main id="main-content" tabIndex={-1} className="paper-grain min-h-screen w-full bg-paper font-sans text-ink-soft">
			<div className="depth-wash relative overflow-hidden pb-16 pt-32 md:pb-24 md:pt-48">
				<div className="mx-auto max-w-md px-6">
					<h1 className={`mb-4 text-center ${HERO_H1_CLASS}`}>
						Contact Sales
					</h1>
					<p className="mb-10 text-base leading-relaxed text-ink-soft text-center md:text-lg">
						Get in touch with our sales team to discuss your
						enterprise needs and how Rivet can help.
					</p>
					<div className="rounded-2xl border border-ink/10 bg-white/55 p-6 sm:p-8">
						<SalesForm />
					</div>
				</div>
			</div>
		</main>
	);
}
