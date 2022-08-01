import { NodeDefinition, EdgeDefinition, ElementDefinition } from "cytoscape";
import { DirModel, ImportModel, TsFileModel } from "./DirModel";

/**
 *
 * @param dirModel
 * @param elements ElementDefinitionを受け取るのは、他のディレクトリから読み取った情報をマージしたい場合に備えている
 * @returns
 */
export async function createGraph(
  dirModels: DirModel[],
  elements: ElementDefinition[] = []
): Promise<ElementDefinition[]> {
  if (!dirModels) return [];
  const nodes = dirModels.map(createNodes).flat();
  const edges = dirModels
    .map((dirModel) => createEdges(nodes, dirModel))
    .flat();
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
  const target = findTarget(nodes, tsfile, imp);
  if (!target) return undefined;
  const sourceId = generateId(tsfile);
  const targetId = target.data.id!;
  return {
    data: {
      id: `${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
    },
  };
}

// TODO エイリアスの解決
function findTarget(
  nodes: NodeDefinition[],
  tsfile: Pick<TsFileModel, "name" | "parent">,
  imp: ImportModel
): NodeDefinition | undefined {
  let absolutePath = getAbsolutePath(tsfile, imp);
  const extentions = [".ts", ".tsx", ".js", ".jsx"] as const;
  const ext = extentions.find((extention) => absolutePath.endsWith(extention));
  if (ext) {
    absolutePath = absolutePath.substring(0, absolutePath.length - ext.length);
  }

  const targetNode = nodes.find((node) => {
    const id = node.data.id;
    if (!id) return false;
    const ext = extentions.find((extention) => id.endsWith(extention));
    return (
      (ext ? id.substring(0, id.length - ext.length) : id) === absolutePath
    );
  });

  if (targetNode) return targetNode;

  // 解決が困難なパスはあてずっぽう

  // '/' を含まない場合はライブラリである（現状、ライブラリの場合は undefined を返す）
  if (!absolutePath.includes("/")) return undefined;

  // absolutePath の根元のディレクトリ名から順に消していって endWith で一致したらそれを信用する。（あてずっぽうなので今はこれで良い）
  const noAlias = absolutePath.substring(absolutePath.indexOf("/"));
  return nodes.find((node) => {
    const id = node.data.id;
    if (!id) return false;
    const ext = extentions.find((extention) => id.endsWith(extention));
    return (ext ? id.substring(0, id.length - ext.length) : id).endsWith(
      noAlias
    );
  });
}

/**
 * インポートモジュールの、解決可能な限りの絶対パスを導き出す
 */
function getAbsolutePath(
  tsfile: Pick<TsFileModel, "name" | "parent">,
  imp: ImportModel
) {
  // tsfile.parent は親ディレクトリのパス @example 'a/b/c'
  let tmpPath = tsfile.parent.path.split("/");
  //  imp.libraryName は import 文の from 後の部分 @example 'a/a/b(.ts)'
  const splitedImportedLib = imp.libraryName.split("/");

  splitedImportedLib.forEach((dirname, i) => {
    if (i === 0 && dirname !== "." && dirname !== "..") {
      // 最初の要素が './' または '../' じゃない場合は相対パスじゃないと判断し tmpPath をクリアする
      tmpPath = [dirname];
      return;
    }
    if (dirname === ".") {
      // './' の場合、指すディレクトリは変わらない
      return;
    }
    if (dirname === "..") {
      // '../' は一つ親のディレクトリを指す
      tmpPath.pop();
      return;
    }
    // どれでもない場合はその dirname のディレクトリに移動
    tmpPath.push(dirname);
  });

  return tmpPath.join("/");
}

function exists<T>(t: T | undefined | null): t is T {
  return t !== undefined && t !== null;
}

function generateId(tsfile: Pick<TsFileModel, "name" | "parent">): string {
  return `${tsfile.parent.path}/${tsfile.name}`;
}
