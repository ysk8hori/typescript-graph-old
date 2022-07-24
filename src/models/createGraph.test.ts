import { test, describe, expect } from "vitest";
import { createEdge } from "./createGraph";

describe("createEdge", () => {
  test("子ディレクトリのファイルを参照するエッジを生成できる", () => {
    const edge = createEdge(
      [
        {
          group: "nodes",
          data: {
            id: "tes/a",
            alias: "tes/a",
          },
        },
        {
          group: "nodes",
          data: {
            id: "tes/a/a-1.ts",
            alias: "a-1.ts",
            parent: "tes/a",
          },
        },
      ],
      { name: "index.ts", parent: { path: "tes" } },
      { libraryName: "./a/a-1", src: 'import { a1 } from "./a/a-1";' }
    );
    expect(edge).toEqual({
      data: { source: "tes/index.ts", target: "tes/a/a-1.ts" },
    });
  });
  test("親ディレクトリのファイルを参照するエッジを生成できる", () => {
    const edge = createEdge(
      [
        {
          group: "nodes",
          data: {
            id: "tes/dummyUtil.ts",
            alias: "dummyUtil.ts",
          },
        },
        {
          group: "nodes",
          data: {
            id: "tes/a",
            alias: "tes/a",
          },
        },
        {
          group: "nodes",
          data: {
            id: "tes/a/a-2.ts",
            alias: "a-2.ts",
            parent: "tes/a",
          },
        },
      ],
      { name: "a-2.ts", parent: { path: "tes/a" } },
      {
        libraryName: "../dummyUtil",
        src: 'import { util } from "../dummyUtil";',
      }
    );
    expect(edge).toEqual({
      data: { source: "tes/a/a-2.ts", target: "tes/dummyUtil.ts" },
    });
  });
  test.skip("ライブラリの名前を含むディレクトリを参照先にしない", () => {
    // 'cytoscape' をインポートする際、本来は参照先が存在しないはずだが、 'cytoscape' の名前を含むディレクトリを参照先にしてしまうなどのバグがあった。
    const edge = createEdge(
      [
        {
          group: "nodes",
          data: {
            id: "cytoscape/dummy.ts",
            alias: "dummy.ts",
          },
        },
        {
          group: "nodes",
          data: {
            id: "tes/a",
            alias: "tes/a",
          },
        },
        {
          group: "nodes",
          data: {
            id: "tes/a/a-2.ts",
            alias: "a-2.ts",
            parent: "tes/a",
          },
        },
      ],
      { name: "a-2.ts", parent: { path: "tes/a" } },
      {
        libraryName: "cytoscape",
        src: 'import cytoscape from "cytoscape";',
      }
    );
    expect(edge).toEqual({
      data: { source: "tes/a/a-2.ts", target: "cytoscape" },
    });
  });
  test("相対パスを正しく解決する", () => {
    // 'cytoscape' をインポートする際、本来は参照先が存在しないはずだが、 'cytoscape' の名前を含むディレクトリを参照先にしてしまうなどのバグがあった。
    const edge = createEdge(
      [
        {
          group: "nodes",
          data: {
            id: "a/b.ts",
            alias: "b.ts",
          },
        },
        {
          group: "nodes",
          data: {
            id: "a/a.ts",
            alias: "a.ts",
          },
        },
        {
          group: "nodes",
          data: {
            id: "a/a",
            alias: "a/a",
          },
        },
        {
          group: "nodes",
          data: {
            id: "a/a/b.ts",
            alias: "b.ts",
            parent: "a/a",
          },
        },
        {
          group: "nodes",
          data: {
            id: "a/a/a.ts",
            alias: "a.ts",
            parent: "a/a",
          },
        },
        {
          group: "nodes",
          data: {
            id: "a/a/a",
            alias: "a/a/a",
            parent: "a/a",
          },
        },
        {
          group: "nodes",
          data: {
            id: "a/a/a/b.ts",
            alias: "b.ts",
            parent: "a/a/a",
          },
        },
        {
          group: "nodes",
          data: {
            id: "a/a/a/a.ts",
            alias: "a.ts",
            parent: "a/a/a",
          },
        },
        {
          group: "nodes",
          data: {
            id: "a/a/b",
            alias: "a/a/b",
            parent: "a/a",
          },
        },
        {
          group: "nodes",
          data: {
            id: "a/a/b/b.ts",
            alias: "b.ts",
            parent: "a/a/b",
          },
        },
        {
          // ここから '../../b/b' を import する
          group: "nodes",
          data: {
            id: "a/a/b/a.ts",
            alias: "a.ts",
            parent: "a/a/b",
          },
        },
        {
          group: "nodes",
          data: {
            id: "a/b",
            alias: "a/b",
          },
        },
        {
          // ここを参照している
          group: "nodes",
          data: {
            id: "a/b/b.ts",
            alias: "b.ts",
            parent: "a/b",
          },
        },
        {
          group: "nodes",
          data: {
            id: "a/b/a.ts",
            alias: "a.ts",
            parent: "a/b",
          },
        },
      ],
      { name: "a.ts", parent: { path: "a/a/a" } },
      {
        src: 'import b from "../../b/b";',
        libraryName: "../../b/b",
      }
    );
    expect(edge).toEqual({
      data: { source: "a/a/a/a.ts", target: "a/b/b.ts" },
    });
  });
  test("エイリアスのパスをあてずっぽうで解決する", () => {
    // 'cytoscape' をインポートする際、本来は参照先が存在しないはずだが、 'cytoscape' の名前を含むディレクトリを参照先にしてしまうなどのバグがあった。
    const edge = createEdge(
      [
        {
          group: "nodes",
          data: {
            id: "a/b.ts",
            alias: "b.ts",
          },
        },
        {
          group: "nodes",
          data: {
            id: "a/a.ts",
            alias: "a.ts",
          },
        },
        {
          group: "nodes",
          data: {
            id: "a/a",
            alias: "a/a",
          },
        },
        {
          group: "nodes",
          data: {
            id: "a/a/b.ts",
            alias: "b.ts",
            parent: "a/a",
          },
        },
        {
          group: "nodes",
          data: {
            id: "a/a/a.ts",
            alias: "a.ts",
            parent: "a/a",
          },
        },
        {
          group: "nodes",
          data: {
            id: "a/a/a",
            alias: "a/a/a",
            parent: "a/a",
          },
        },
        {
          group: "nodes",
          data: {
            id: "a/a/a/b.ts",
            alias: "b.ts",
            parent: "a/a/a",
          },
        },
        {
          group: "nodes",
          data: {
            id: "a/a/a/a.ts",
            alias: "a.ts",
            parent: "a/a/a",
          },
        },
        {
          group: "nodes",
          data: {
            id: "a/a/b",
            alias: "a/a/b",
            parent: "a/a",
          },
        },
        {
          // ここがヒットする
          group: "nodes",
          data: {
            id: "a/a/b/b.ts",
            alias: "b.ts",
            parent: "a/a/b",
          },
        },
        {
          // ここから '＠/b/b' を import する
          group: "nodes",
          data: {
            id: "a/a/b/a.ts",
            alias: "a.ts",
            parent: "a/a/b",
          },
        },
        {
          group: "nodes",
          data: {
            id: "a/b",
            alias: "a/b",
          },
        },
        {
          group: "nodes",
          data: {
            id: "a/b/b.ts",
            alias: "b.ts",
            parent: "a/b",
          },
        },
        {
          group: "nodes",
          data: {
            id: "a/b/a.ts",
            alias: "a.ts",
            parent: "a/b",
          },
        },
      ],
      { name: "a.ts", parent: { path: "a/a/a" } },
      {
        src: 'import b from "＠/b/b";',
        libraryName: "＠/b/b",
      }
    );
    expect(edge).toEqual({
      data: { source: "a/a/a/a.ts", target: "a/a/b/b.ts" },
    });
  });
});
