import {
  EdgeDefinition,
  ElementDefinition,
  Singular,
  EdgeSingular,
  NodeSingular,
} from "cytoscape";
import cytoscape from "cytoscape";
import { useEffect, useRef } from "react";
import styled from "styled-components";
import klay from "cytoscape-klay";
import fcose from "cytoscape-fcose";
import cytoscapeStyles from "./cytoscapeStyles";
import { klayOption, fcoseOption } from "./cytoscapeLayoutOptions";
import cxtmenu from "cytoscape-cxtmenu";

cytoscape.use(klay);
cytoscape.use(fcose);
cytoscape.use(cxtmenu);

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
    cy.layout(klayOption).run();
    // the default values of each option are outlined below:
    let defaults = {
      menuRadius: function (ele: any) {
        return 50;
      }, // the outer radius (node center to the end of the menu) in pixels. It is added to the rendered size of the node. Can either be a number or function as in the example.
      selector: "node", // elements matching this Cytoscape.js selector will trigger cxtmenus
      commands: [
        // an array of commands to list in the menu or a function that returns the array
        {
          // example command
          fillColor: "rgba(200, 200, 200, 0.75)", // optional: custom background color for item
          content: "Abstraction", // html/text content to be displayed in the menu
          contentStyle: {}, // css key:value pairs to set the command's css in js if you want
          select: function (ele: Singular) {
            // a function to execute when the command is selected
            console.log(ele.id()); // `ele` holds the reference to the active element
            const id = ele.id();

            // 選択したディレクトリ（ノードも選択されるのだが）内のノードに関連するエッジを非表示にする
            const mySourceEdges = cy
              .edges()
              .filter(
                (edge) =>
                  edge.source().id().includes(id) &&
                  !edge.target().id().includes(id)
              );
            const myTargetEdges = cy
              .edges()
              .filter(
                (edge) =>
                  edge.target().id().includes(id) &&
                  !edge.source().id().includes(id)
              );

            // 選択したディレクトリ（ノードも選択されるのだが）内のノードに関連するエッジを選択したディレクトリ向けにする。そのうえで重複排除する。
            const sourceEdge = mySourceEdges.map((edge: EdgeSingular) => {
              const newEdge: EdgeDefinition = {
                data: {
                  id: `${id}-${edge.target().id()}`,
                  source: id,
                  target: edge.target().id(),
                },
              };
              return newEdge;
            });
            const targetEdge = myTargetEdges.map((edge: EdgeSingular) => {
              const newEdge: EdgeDefinition = {
                data: {
                  id: `${edge.source().id()}-${id}`,
                  source: edge.source().id(),
                  target: id,
                },
              };
              return newEdge;
            });

            cy.add([...sourceEdge, ...targetEdge]);

            cy.remove(mySourceEdges);
            cy.remove(myTargetEdges);
            cy.remove(
              cy
                .nodes()
                .filter(
                  (node) =>
                    id.length < node.id().length && node.id().includes(id)
                )
            );
            cy.layout({ ...klayOption, animate: true }).run();
          },
          enabled: true, // whether the command is selectable
        },
      ], // function( ele ){ return [ /*...*/ ] }, // a function that returns commands or a promise of commands
      fillColor: "rgba(0, 0, 0, 0.75)", // the background colour of the menu
      activeFillColor: "rgba(1, 105, 217, 0.75)", // the colour used to indicate the selected command
      activePadding: 20, // additional size in pixels for the active command
      indicatorSize: 24, // the size in pixels of the pointer to the active command, will default to the node size if the node size is smaller than the indicator size,
      separatorWidth: 3, // the empty spacing in pixels between successive commands
      spotlightPadding: 4, // extra spacing in pixels between the element and the spotlight
      adaptativeNodeSpotlightRadius: false, // specify whether the spotlight radius should adapt to the node size
      minSpotlightRadius: 24, // the minimum radius in pixels of the spotlight (ignored for the node if adaptativeNodeSpotlightRadius is enabled but still used for the edge & background)
      maxSpotlightRadius: 38, // the maximum radius in pixels of the spotlight (ignored for the node if adaptativeNodeSpotlightRadius is enabled but still used for the edge & background)
      openMenuEvents: "cxttapstart taphold", // space-separated cytoscape events that will open the menu; only `cxttapstart` and/or `taphold` work here
      itemColor: "white", // the colour of text in the command's content
      itemTextShadowColor: "transparent", // the text shadow colour of the command's content
      zIndex: 9999, // the z-index of the ui div
      atMouse: false, // draw menu at mouse position
      outsideMenuCancel: false, // if set to a number, this will cancel the command if the pointer is released outside of the spotlight, padded by the number given
    };

    let menu = cy.cxtmenu(defaults as any);
  }, [elements, ref]);
  return <Container ref={ref}></Container>;
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: #e0e0e0;
`;
