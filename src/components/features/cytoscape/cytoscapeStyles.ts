const cytoscapeStyles: cytoscape.Stylesheet[] = [
  {
    selector: "node",
    style: {
      "background-color": "#2B65EC",
      label: "data(alias)",
    },
  },

  {
    selector: "node:parent",
    style: {
      "background-opacity": 0.233,
      "border-color": "#2B65EC",
    },
  },

  {
    selector: "edge",
    style: {
      "curve-style": "unbundled-bezier",
      "control-point-distances": [60],
      "control-point-weights": [0.5],
      "line-color": "#2B65EC",
      "target-arrow-shape": "triangle",
      "target-arrow-color": "#2B65EC",
      "arrow-scale": 1,
      "mid-target-arrow-color": "#2B65EC",
      // opacity: 0.8,
      width: 1.5,
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
      "target-arrow-color": "#F08080",
    },
  },
];

export default cytoscapeStyles;
