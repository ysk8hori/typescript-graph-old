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
  console.log(elements);
  return elements;
}

async function createDirNode(
  handle: FileSystemDirectoryHandle
): Promise<ElementDefinition[]> {
  const dir = await convertToDirModel(handle);
  const nodes = createNodes(dir);
  const edges = createEdges(nodes, dir);
  return [...nodes, ...edges];
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
      data: {
        id: dirModel.path,
        alias: dirModel.path,
        parent: dirModel.parent?.path,
      },
    },
  ];
}
function createTsFileNode(tsfile: TsFileModel): NodeDefinition {
  return {
    group: "nodes",
    data: {
      id: generateId(tsfile),
      alias: tsfile.name,
      parent: tsfile.parent.path,
    },
  };
}

function createEdges(
  nodes: NodeDefinition[],
  dirModel: DirModel
): EdgeDefinition[] {
  const edges1 =
    dirModel.tsFiles
      ?.map((tsfile) =>
        tsfile.imports.map((imp) => createEdge(nodes, tsfile, imp))
      )
      .flat()
      .filter(exists) ?? [];
  return [
    ...edges1,
    ...(dirModel.directories
      ?.map((dir) => createEdges(nodes, dir))
      .flat()
      .filter(exists) ?? []),
  ];
}
function createEdge(
  nodes: NodeDefinition[],
  tsfile: TsFileModel,
  imp: ImportModel
): EdgeDefinition | undefined {
  console.log(nodes.map((node) => node.data.id));
  console.log(convertToSearchableString(imp.libraryName));
  const target = nodes.find((node) =>
    node.data.id?.includes(convertToSearchableString(imp.libraryName))
  )?.data.id;
  console.log(target);
  if (!target) return undefined;
  return {
    data: {
      source: generateId(tsfile),
      target,
    },
  };
}

function convertToSearchableString(libraryName: string) {
  return libraryName.replaceAll(/\.\.\/|@\//g, "");
}

function exists<T>(t: T | undefined | null): t is T {
  return t !== undefined && t !== null;
}

function generateId(tsfile: TsFileModel): string {
  return `${tsfile.parent.path}/${tsfile.name}`;
}
