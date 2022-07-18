import { NodeDefinition, EdgeDefinition, ElementDefinition } from "cytoscape";
import cytoscape from "cytoscape";
import { useEffect, useRef } from "react";
import styled from "styled-components";

export default function CytoscapeGraph({
  elements,
}: {
  elements: ElementDefinition[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref) return;
    cytoscape({
      container: ref.current,
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#2B65EC",
            label: "data(alias)",
          },
        },

        {
          selector: ":parent",
          style: {
            "background-opacity": 0.333,
            "border-color": "#2B65EC",
          },
        },

        {
          selector: "edge",
          style: {
            "line-color": "#2B65EC",
          },
        },

        {
          selector: "node:selected",
          style: {
            "background-color": "#F08080",
            "border-color": "red",
          },
        },

        {
          selector: "edge:selected",
          style: {
            "line-color": "#F08080",
          },
        },
      ],
      elements,
    });
  }, [elements, ref]);
  return (
    <div>
      <h1>cytoscape</h1>
      <Container ref={ref}></Container>
    </div>
  );
}

const Container = styled.div`
  width: 100vw;
  height: 100vh;
`;
