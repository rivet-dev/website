import { listSkills, renderSkill } from "@/metadata/skills";

export function GET() {
  const skill = listSkills().find(
    (skill) => skill.name === "rivet-sandbox-agent",
  );
  if (!skill) throw new Error("Sandbox Agent docs have not been assembled");
  return new Response(renderSkill(skill), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
