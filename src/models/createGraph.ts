import { NodeDefinition, EdgeDefinition, ElementDefinition } from "cytoscape";
import {
  convertToDirModel,
  DirModel,
  ImportModel,
  TsFileModel,
} from "./DirModel";

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
}

function createNodes(dirModel: DirModel): NodeDefinition[] {
  return [
    ...createDirectoryNode(dirModel),
    ...(dirModel.tsFiles ?? []).map(createTsFileNode),
    ...(dirModel.directories ?? []).map(createNodes).flat(),
  ];
}
function createDirectoryNode(dirModel: DirModel): NodeDefinition[] {
  if (!dirModel.parent) return [];
  return [
    {
      group: "nodes",
      data: { id: dirModel.path, parent: dirModel.parent?.path },
    },
  ];
}
function createTsFileNode(tsfile: TsFileModel): NodeDefinition {
  return {
    group: "nodes",
    data: { id: tsfile.name, parent: tsfile.parent.path },
  };
}

// function createEdges(dirModel:DirModel): EdgeDefinition[] {

// }
// function createEdge(nodes:NodeDefinition[],tsFile:TsFileModel, imp:ImportModel): EdgeDefinition {
//   return {
//     data:{source:tsFile.name, target:nodes.find(node=> node.data.id === imp.)}
//   }

// }
