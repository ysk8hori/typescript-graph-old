import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { ElementDefinition } from "cytoscape";
import { createGraph } from "./models/createGraph";
import CytoscapeGraph from "./components/features/cytoscape/CytoscapeGraph";
import { convertToDirModel, DirModel } from "./models/DirModel";
import { ReactFlowGraph } from "./components/features/reactflow/ReactFlowGraph";
import { convert } from "./components/features/reactflow/converter";

function App() {
  const [elements, setElements] = useState<ElementDefinition[]>([]);
  const [dirModel, setDirModel] = useState<DirModel | undefined>();
  const readDir = useCallback(async () => {
    const dirHandle = await showDirectoryPicker({ mode: "read" });
    if (!dirHandle) return;
    const dirModel = await convertToDirModel(dirHandle);
    setDirModel(dirModel);
    if (!dirModel) return;
    createGraph(dirModel).then(setElements);
  }, [setElements]);
  const { nodes, edges } = useMemo(() => {
    return convert(elements);
  }, [elements]);

  return (
    <Container>
      {/* <CytoscapeGraph elements={elements} /> */}

      <ReactFlowGraph nodes={nodes} edges={edges} />
      <div style={{ zIndex: 1 }}>
        <button onClick={readDir}>chose directory</button>
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
