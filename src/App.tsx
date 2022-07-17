import {
  DefaultDeclaration,
  FunctionDeclaration,
  NamedImport,
  TypescriptParser,
  VariableDeclaration,
} from "browser-typescript-parser";
import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { NodeDefinition, EdgeDefinition, ElementDefinition } from "cytoscape";
import { TsFile } from "./models/TsFile";
import { createGraph } from "./models/createGraph";
import CytoscapeGraph from "./components/features/CytoscapeGraph";

function App() {
  const [dirHandle, setDirHandle] = useState<
    undefined | FileSystemDirectoryHandle
  >();
  const readDir = useCallback(async () => {
    const dirHandle = await showDirectoryPicker();
    setDirHandle(dirHandle);
  }, [setDirHandle]);
  const parser = useMemo(() => new TypescriptParser(), []);
  const onClick = useCallback(async () => {
    // const showDirectoryPicker = (window as any).showDirectoryPicker;
    if (!showDirectoryPicker) return null;
    const dirHandle = await showDirectoryPicker();
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
                  .filter((dec) => (console.log(dec), (dec as any).isExported))
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
              } as TsFile)
          )
      );
    }
    // setTsFiles(await Promise.all(promises));

    // const tsconfig = await getTsConfig(dirHandle);
    // if (!tsconfig) return;
    // const tsconfigContents = await tsconfig
    //   .getFile()
    //   .then((file) => file.text());
    // const { config } = ts.readConfigFile(tsconfig.name, () => tsconfigContents);
  }, [parser]);

  const [elements, setElements] = useState<ElementDefinition[]>([]);
  useEffect(() => {
    if (!dirHandle) return;
    createGraph(dirHandle).then(setElements);
  }, [dirHandle]);
  console.log(elements);

  return (
    <Container>
      <div>
        <div>Welcome to Vite!</div>
        <button onClick={readDir}>dir</button>
      </div>
      <CytoscapeGraph elements={elements} />
    </Container>
  );
}

export default App;

async function getTsConfig(dirHandle: FileSystemDirectoryHandle) {
  for await (const entry of dirHandle.values()) {
    if (entry.kind === "directory") continue;
    if (entry.name === "tsconfig.json") return entry;
  }
  return null;
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
`;
