import {
  DefaultDeclaration,
  FunctionDeclaration,
  TypescriptParser,
  VariableDeclaration,
} from "browser-typescript-parser";

export type Dir = {
  path: string;
  parent?: Dir;
  tsFiles?: TsFile[];
  directories?: Dir[];
};

export type TsFile = {
  name: string;
  parent: Dir;
  imports: Import[];
  exports: Export[];
};

type Import = {
  src: string;
};

type Export = {
  name: string;
  type: "type" | "function" | "const" | "let";
  src: string;
  isDefault: boolean;
};

export async function convertToDir(
  dirHandle: FileSystemDirectoryHandle,
  parent?: Dir,
  _parser?: TypescriptParser
): Promise<Dir> {
  const dir: Dir = {
    path: parent ? `${parent.path}/${dirHandle.name}` : dirHandle.name,
    parent,
  };
  const parser = _parser ?? new TypescriptParser();
  const tsFiles = await analyzeTsFiles(dirHandle, dir, parser);
  dir.tsFiles = tsFiles;
  // dir.directories = dirHandle.

  const promises: Promise<Dir>[] = [];
  for await (const entry of dirHandle.values()) {
    if (entry.kind !== "directory") continue;
    if (/^\./.test(entry.name)) continue;
    promises.push(convertToDir(await dirHandle.getDirectoryHandle(entry.name)));
  }
  dir.directories = await Promise.all(promises);
  return dir;
}

/** dirHandle のディレクトリが保有するTypeScriptのファイルを TsFile に変換する */
async function analyzeTsFiles(
  dirHandle: FileSystemDirectoryHandle,
  parent: Dir,
  parser: TypescriptParser
) {
  const promises = [];
  for await (const entry of dirHandle.values()) {
    if (entry.kind !== "file") continue;
    if (/test|spec|stories/.test(entry.name)) continue;
    if (!/.*.ts$|.*.tsx$|.*.js$|.*.jsx$/.test(entry.name)) continue;
    promises.push(
      entry
        .getFile()
        .then(async (file) => ({ name: file.name, text: await file.text() }))
        .then(async ({ name, text }) => ({
          name,
          file: await parser.parseSource(text),
          text,
        }))
        .then(
          ({ name, file, text }) =>
            ({
              name,
              imports: file.imports.map((imp) => ({
                src: text.substring(imp.start ?? 0, imp.end),
              })),
              exports: file.declarations
                .map((dec, _, declarations) => {
                  if ((dec as any).isExported) return dec;
                  const def = declarations.find(
                    (dec) => dec instanceof DefaultDeclaration
                  );
                  if (def?.name !== dec.name) return dec;
                  (dec as any).isExported = true;
                  (dec as any).isDefault = true;
                  return dec;
                })
                .filter((dec) => (dec as any).isExported)
                // .filter((dec) => (console.log(dec), (dec as any).isExported))
                .filter((dec) => !(dec instanceof DefaultDeclaration))
                .map((dec) => ({
                  name: dec.name,
                  type:
                    dec instanceof VariableDeclaration
                      ? dec.isConst
                        ? "const"
                        : "let"
                      : dec instanceof FunctionDeclaration
                      ? "function"
                      : "type",
                  src: text.substring(dec.start ?? 0, dec.end),
                  isDefault: !!(dec as any).isDefault,
                })),
              parent,
            } as TsFile)
        )
    );
  }
  const tsFiles = await Promise.all(promises);
  return tsFiles;
}

/** dirHandle のディレクトリが保有するTypeScriptのファイルを TsFile に変換する */
async function analyzeDirs(
  dirHandle: FileSystemDirectoryHandle,
  parent: Dir
): Promise<Dir[]> {
  const promises: Dir[] = [];
  for await (const entry of dirHandle.values()) {
    if (entry.kind !== "directory") continue;
    if (/^\./.test(entry.name)) continue;
    promises.push({ path: `${parent.path}.${entry.name}` });
  }
  return await Promise.all(promises);
}
