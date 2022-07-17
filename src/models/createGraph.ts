import { NodeDefinition, EdgeDefinition, ElementDefinition } from "cytoscape";

export function createGraph(
  handle: FileSystemDirectoryHandle,
  elements: ElementDefinition[] = []
): ElementDefinition[] {
  elements.push(createDirNode(handle));
  return elements;
}

function createDirNode(handle: FileSystemDirectoryHandle): ElementDefinition {
  return {
    group: "nodes",
    data: { id: handle.name },
    style: { label: "data(id)" },
  };
}
