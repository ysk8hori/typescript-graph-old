import { NodeDefinition, EdgeDefinition, ElementDefinition } from "cytoscape";
import { DirModel, ImportModel, TsFileModel } from "./DirModel";

/**
 *
 * @param dirModel
 * @param elements ElementDefinitionを受け取るのは、他のディレクトリから読み取った情報をマージしたい場合に備えている
 * @returns
 */
export async function createGraph(
  dirModel: DirModel,
  elements: ElementDefinition[] = []
): Promise<ElementDefinition[]> {
  if (!dirModel) return [];
  const nodes = createNodes(dirModel);
  const edges = createEdges(nodes, dirModel);
  elements.push(...nodes, ...edges);
  return elements;
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
export function createEdge(
  nodes: NodeDefinition[],
  tsfile: Pick<TsFileModel, "name" | "parent">,
  imp: ImportModel
): EdgeDefinition | undefined {
  // if (tsfile.name === "createGraph.ts") {
  console.log(nodes);
  console.log(tsfile);
  console.log(imp);
  // }
  const target = nodes.find((node) =>
    node.data.id?.includes(convertToSearchableString(imp.libraryName))
  )?.data.id;
  if (!target) return undefined;
  return {
    data: {
      source: generateId(tsfile),
      target,
    },
  };
}

function convertToSearchableString(libraryName: string) {
  // TODO: ここ超適当
  return libraryName.replaceAll(/\.\.\/|@\/|\.\//g, "");
}

function exists<T>(t: T | undefined | null): t is T {
  return t !== undefined && t !== null;
}

function generateId(tsfile: Pick<TsFileModel, "name" | "parent">): string {
  return `${tsfile.parent.path}/${tsfile.name}`;
}
