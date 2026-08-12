import { SalesForm } from "./form";
import { HERO_H1_CLASS } from "../typography";

export default function SalesPageClient() {
	return (
		<main className="paper-grain min-h-screen w-full">
			<div className="relative overflow-hidden pt-32 md:pt-48 pb-12">
				<div className="mx-auto max-w-md px-6">
					<h1 className={`mb-4 text-center ${HERO_H1_CLASS}`}>
						Contact Sales
					</h1>
					<p className="mb-10 text-base leading-relaxed text-ink-soft text-center">
						Get in touch with our sales team to discuss your
						enterprise needs and how Rivet can help.
					</p>
					<SalesForm />
				</div>
			</div>
		</main>
	);
}
