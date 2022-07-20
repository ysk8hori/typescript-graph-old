import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { ElementDefinition } from "cytoscape";
import { createGraph } from "./models/createGraph";
import CytoscapeGraph from "./components/features/cytoscape/CytoscapeGraph";

function App() {
  const [elements, setElements] = useState<ElementDefinition[]>([]);
  const readDir = useCallback(async () => {
    const dirHandle = await showDirectoryPicker({ mode: "read" });
    if (!dirHandle) return;
    createGraph(dirHandle).then(setElements);
  }, [setElements]);

  return (
    <Container>
      <CytoscapeGraph elements={elements} />
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
