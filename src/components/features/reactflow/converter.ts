import { ElementDefinition } from "cytoscape";
import { Edge, Node, Position } from "react-flow-renderer";

export function convert(elements: ElementDefinition[]): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  elements.forEach((ele, i) =>
    ele.group === "nodes"
      ? nodes.push({
          id: ele.data.id!,
          type: isParent(ele) ? "group" : "default",
          data: {
            label: ele.data.alias,
          },
          position: { x: i * 100, y: i * 100 },
          parentNode: (ele.data.parent as string).includes("/")
            ? ele.data.parent
            : undefined,
          targetPosition: Position.Left,
          sourcePosition: Position.Right,
          width: isParent(ele) ? 300 : 150,
          height: isParent(ele) ? 200 : 50,
          style: {
            backgroundColor: isParent(ele) ? "pink" : "rgba(255,255,255,0)",
            width: isParent(ele) ? 300 : 150,
            height: isParent(ele) ? 200 : 50,
          },
        })
      : edges.push({
          id: ele.data.id!,
          source: ele.data.source,
          target: ele.data.target,
        })
  );
  return { nodes, edges };
}

function isParent(ele: ElementDefinition) {
  return ele.data.nodeType === "directory";
}
