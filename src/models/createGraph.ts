import { NodeDefinition, EdgeDefinition, ElementDefinition } from "cytoscape";
import { convertToDir } from "./TsFile";

export async function createGraph(
  handle: FileSystemDirectoryHandle,
  elements: ElementDefinition[] = []
): Promise<ElementDefinition[]> {
  elements.push(...(await createDirNode(handle)));
  return elements;
}

async function createDirNode(
  handle: FileSystemDirectoryHandle
): Promise<ElementDefinition[]> {
  const dir = await convertToDir(handle);
  console.log(dir);
  const asdf: { nodes: NodeDefinition; edges: EdgeDefinition[] }[] =
    dir.tsFiles!.map((tsfile) => {
      return {
        nodes: {
          group: "nodes",
          data: { id: tsfile.name, parent: dir.path },
        },
        // edges: tsfile.imports.map((imp) => {
        //   return {
        //     group: "edges",
        //     data: { source: tsfile.name, target: imp.src },
        //   } as EdgeDefinition;
        // }),
        edges: [],
      };
    });
  console.log(asdf);
  return [
    ...asdf
      .map((qwer) => {
        return [qwer.nodes, ...qwer.edges];
      })
      .flat(),
    { group: "nodes", data: { id: dir.path } },
  ];
  // return [
  //   {
  //     group: "nodes",
  //     data: { id: handle.name },
  //   },
  // ];
}
