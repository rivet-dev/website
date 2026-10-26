import { type Expression, parseExpressionAt } from "acorn";
import type { DiagramProps } from "./Diagram";

export type DiagramSpec = Pick<DiagramProps, "id" | "nodes" | "edges">;

/**
 * Reads the first `<Diagram>` in an MDX source, for views that show a guide's
 * diagram without rendering the page, such as the Guides overview cards.
 * `nodes` and `edges` must be literal data (arrays, objects, strings, numbers),
 * which is how every diagram is written. Returns undefined when there is none.
 */
export function diagramFromMdx(source: string | undefined): DiagramSpec | undefined {
	if (!source) return undefined;
	const start = source.search(/<Diagram\b/);
	if (start === -1) return undefined;
	const nodes = attribute(source, start, "nodes");
	if (!Array.isArray(nodes)) return undefined;
	const edges = attribute(source, start, "edges");
	const id = source.slice(start).match(/\bid="([^"]+)"/)?.[1] ?? "diagram";
	return {
		id,
		nodes: nodes as DiagramProps["nodes"],
		edges: Array.isArray(edges) ? (edges as DiagramProps["edges"]) : [],
	};
}

/** Evaluates `name={...}` on the element starting at `start`. */
function attribute(source: string, start: number, name: string): unknown {
	const end = source.indexOf("/>", start);
	const match = new RegExp(`\\b${name}=\\{`, "g");
	match.lastIndex = start;
	const found = match.exec(source);
	if (!found || (end !== -1 && found.index > end)) return undefined;
	const expression = parseExpressionAt(source, found.index + found[0].length, { ecmaVersion: "latest" });
	return literal(expression);
}

/** Converts a literal-only expression to a value. Anything else is rejected. */
function literal(node: Expression | { type: string }): unknown {
	switch (node.type) {
		case "ArrayExpression":
			return (node as Extract<Expression, { type: "ArrayExpression" }>).elements.map((element) =>
				element && element.type !== "SpreadElement" ? literal(element) : undefined,
			);
		case "ObjectExpression": {
			const out: Record<string, unknown> = {};
			for (const property of (node as Extract<Expression, { type: "ObjectExpression" }>).properties) {
				if (property.type !== "Property") throw new Error("diagram data may not use spread");
				const key =
					property.key.type === "Identifier"
						? property.key.name
						: property.key.type === "Literal"
							? String(property.key.value)
							: undefined;
				if (key === undefined) throw new Error("diagram data keys must be names or strings");
				out[key] = literal(property.value as Expression);
			}
			return out;
		}
		case "Literal":
			return (node as Extract<Expression, { type: "Literal" }>).value;
		case "TemplateLiteral": {
			const template = node as Extract<Expression, { type: "TemplateLiteral" }>;
			if (template.expressions.length > 0) throw new Error("diagram data may not interpolate");
			return template.quasis.map((quasi) => quasi.value.cooked).join("");
		}
		case "UnaryExpression": {
			const unary = node as Extract<Expression, { type: "UnaryExpression" }>;
			const value = literal(unary.argument);
			if (unary.operator === "-" && typeof value === "number") return -value;
			throw new Error(`diagram data may not use ${unary.operator}`);
		}
		default:
			throw new Error(`diagram data must be literal, found ${node.type}`);
	}
}
