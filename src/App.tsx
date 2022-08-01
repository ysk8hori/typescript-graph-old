import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { ElementDefinition } from "cytoscape";
import { createGraph } from "./models/createGraph";
import CytoscapeGraph from "./components/features/cytoscape/CytoscapeGraph";
import { convertToDirModel, DirModel } from "./models/DirModel";

function App() {
  const [elements, setElements] = useState<ElementDefinition[]>([]);
  const [dirModels, setDirModels] = useState<DirModel[] | undefined>();
  const readDir = useCallback(async () => {
    const dirHandle = await showDirectoryPicker({ mode: "read" });
    if (!dirHandle) return;
    const dirModel = await convertToDirModel(dirHandle);
    if (!dirModel) {
      setDirModels(undefined);
      return;
    }
    setDirModels([dirModel]);
  }, []);
  const addDir = useCallback(async () => {
    const dirHandle = await showDirectoryPicker({ mode: "read" });
    if (!dirHandle) return;
    const dirModel = await convertToDirModel(dirHandle);
    if (!dirModel) return;
    const newDirModels = [...(dirModels ? dirModels : []), dirModel];
    setDirModels(newDirModels);
    if (!dirModel) return;
  }, [dirModels]);

  useEffect(() => {
    if (dirModels) createGraph(dirModels).then(setElements);
  }, [dirModels]);

  return (
    <Container>
      <CytoscapeGraph elements={elements} />
      <div style={{ zIndex: 1 }}>
        <button onClick={readDir}>chose directory</button>
        <br />
        <button onClick={addDir}>add directory</button>
      </div>
    </Container>
  );
}

export default App;

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  > * {
    position: absolute;
    top: 0;
    left: 0;
  }
`;
