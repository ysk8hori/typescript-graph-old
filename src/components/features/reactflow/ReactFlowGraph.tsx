import { useEffect, useState } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
} from "react-flow-renderer";
import layout from "./layout";

export function ReactFlowGraph({
  nodes: _nodes,
  edges: _edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
}: {
  nodes: Node<any>[] | undefined;
  edges: Edge<any>[] | undefined;
  onNodesChange?: OnNodesChange | undefined;
  onEdgesChange?: OnEdgesChange | undefined;
  onConnect?: OnConnect | undefined;
}) {
  const [[nodes, edges], setElements] = useState<[Node<any>[], Edge<any>[]]>([
    [],
    [],
  ]);
  useEffect(() => {
    if (!_nodes || !_edges) return;
    layout(_nodes, _edges).then(([nodes, edges]) =>
      setElements([nodes, edges])
    );
  }, [_nodes, _edges]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      style={{ height: "100vh", width: "100vw" }}
    >
      <MiniMap />
      <Controls />
    </ReactFlow>
  );
}
