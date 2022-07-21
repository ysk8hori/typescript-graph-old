import { test, describe, expect } from "vitest";
import { createEdge } from "./createGraph";

describe("createEdge", () => {
  test("自分のディレクトリの子ディレクトリのファイルを参照するエッジを生成できる", () => {
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
  test("自分の親ディレクトリのファイルを参照するエッジを生成できる", () => {
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
});
