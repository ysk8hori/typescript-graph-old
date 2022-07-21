import {
  DefaultDeclaration,
  FunctionDeclaration,
  TypescriptParser,
  VariableDeclaration,
} from "browser-typescript-parser";

export type DirModel = {
  path: string;
  parent?: DirModel;
  tsFiles?: TsFileModel[];
  directories?: DirModel[];
};

export type TsFileModel = {
  name: string;
  parent: DirModel;
  imports: ImportModel[];
  exports: ExportModel[];
};

export type ImportModel = {
  src: string;
  libraryName: string;
};

export type ExportModel = {
  name: string;
  type: "type" | "function" | "const" | "let";
  src: string;
  isDefault: boolean;
};

export async function convertToDirModel(
  dirHandle: FileSystemDirectoryHandle,
  parent?: DirModel,
  _parser?: TypescriptParser
): Promise<DirModel | undefined> {
  if (
    /test|spec|stories|node_modules|dist|docs|\_\_|^\..*/.test(dirHandle.name)
  ) {
    return undefined;
  }
  const dir: DirModel = {
    path: parent ? `${parent.path}/${dirHandle.name}` : dirHandle.name,
    parent,
  };
  const parser = _parser ?? new TypescriptParser();
  const tsFiles = await analyzeTsFiles(dirHandle, dir, parser);
  dir.tsFiles = tsFiles.filter(
    (fileModel): fileModel is TsFileModel => !!fileModel
  );

  const promises: Promise<DirModel | undefined>[] = [];
  for await (const entry of dirHandle.values()) {
    if (entry.kind === "file") continue;
    promises.push(
      convertToDirModel(
        await dirHandle.getDirectoryHandle(entry.name),
        dir,
        parser
      )
    );
  }
  dir.directories = (await Promise.all(promises)).filter(
    (dir): dir is DirModel => !!dir
  );

  // TS のファイルが存在しないディレクトリは表示しない
  if (dir.tsFiles.length === 0 && dir.directories.length === 0)
    return undefined;
  return dir;
}

/** dirHandle のディレクトリが保有するTypeScriptのファイルを TsFile に変換する */
async function analyzeTsFiles(
  dirHandle: FileSystemDirectoryHandle,
  parent: DirModel,
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
          file: await parser
            .parseSource(text)
            .catch(
              (e) => (
                console.warn(
                  `${name} は TypeScript として認識できませんでした。`,
                  e
                ),
                undefined
              )
            ),
          text,
        }))
        .then(({ name, file, text }) =>
          file === undefined
            ? undefined
            : ({
                name,
                imports: file.imports.map((imp) => ({
                  src: text.substring(imp.start ?? 0, imp.end),
                  libraryName: imp.libraryName,
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
              } as TsFileModel)
        )
    );
  }
  const tsFiles = await Promise.all(promises);
  return tsFiles;
}
