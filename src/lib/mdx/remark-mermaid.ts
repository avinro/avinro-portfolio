import { visit } from "unist-util-visit";
import type { Root, Code } from "mdast";
import type { Plugin } from "unified";

export const remarkMermaidToComponent: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "code", (node: Code, index, parent) => {
      if (node.lang !== "mermaid" || !parent || index === undefined) return;

      const encoded = Buffer.from(node.value, "utf-8").toString("base64");

      const jsxNode = {
        type: "mdxJsxFlowElement",
        name: "MermaidDiagram",
        attributes: [
          {
            type: "mdxJsxAttribute",
            name: "source",
            value: encoded,
          },
        ],
        children: [],
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (parent.children as any[]).splice(index, 1, jsxNode);
    });
  };
};
