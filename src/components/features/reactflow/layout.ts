import ELK from "elkjs";
import { Node, Edge } from "react-flow-renderer";

export default async function layout(
  nodes: Node[],
  edges: Edge[]
): Promise<[Node[], Edge[]]> {
  const elk = new ELK();

  const graph = {
    id: "root",
    layoutOptions: { "elk.algorithm": "layered" },
    children: nodes.map((node) => ({
      ...node,
      width: node.width!,
      height: node.height!,
    })),
    edges: edges.map((edge) => ({
      ...edge,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const layouted = await elk.layout(graph);
  return [
    nodes.map((node) => {
      const child = layouted.children?.find((child) => node.id === child.id);
      if (child) {
        node.position = { x: child.x!, y: child.y! };
      }
      return node;
    }),
    edges,
  ];
}
