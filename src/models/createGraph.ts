import { NodeDefinition, EdgeDefinition, ElementDefinition } from "cytoscape";
import { convertToDirModel, DirModel, TsFileModel } from "./DirModel";

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
  const dir = await convertToDirModel(handle);

  return [...createNodes(dir)];
  // return [
  //   {
  //     group: "nodes",
  //     data: { id: handle.name },
  //   },
  // ];
}

function createNodes(dirModel: DirModel): NodeDefinition[] {
  return [
    ...(dirModel.tsFiles ?? []).map((tsfile) =>
      createNode(tsfile, tsfile.parent)
    ),
    ...(dirModel.directories ?? []).map(createNodes).flat(),
  ];
}
function createNode(tsfile: TsFileModel, parent: DirModel): NodeDefinition {
  console.log(parent);
  return {
    group: "nodes",
    data: { id: tsfile.name, parent: parent.path },
  };
}

// function createEdges(dirModel:DirModel): EdgeDefinition[] {

// }
// function createEdge()
