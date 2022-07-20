import { NodeDefinition, EdgeDefinition, ElementDefinition } from "cytoscape";
import cytoscape from "cytoscape";
import { useEffect, useRef } from "react";
import styled from "styled-components";
import klay from "cytoscape-klay";
import fcose from "cytoscape-fcose";
import cytoscapeStyles from "./cytoscapeStyles";
import { klayOption, fcoseOption } from "./cytoscapeLayoutOptions";

cytoscape.use(klay);
cytoscape.use(fcose);

export default function CytoscapeGraph({
  elements,
}: {
  elements: ElementDefinition[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref) return;
    const cy = cytoscape({
      container: ref.current,
      style: cytoscapeStyles,
      elements,
    });
    cy.layout(fcoseOption).run();
  }, [elements, ref]);
  return <Container ref={ref}></Container>;
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: #e0e0e0;
`;
