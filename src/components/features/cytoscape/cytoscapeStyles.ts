const cytoscapeStyles: cytoscape.Stylesheet[] = [
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
      "background-opacity": 0.233,
      "border-color": "#2B65EC",
    },
  },

  {
    selector: "edge",
    style: {
      "line-color": "#2B65EC",
      "target-arrow-shape": "triangle",
      "target-arrow-color": "#2B65EC",
      "mid-target-arrow-shape": "triangle",
      "arrow-scale": 2,
      "mid-target-arrow-color": "#2B65EC",
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
];

export default cytoscapeStyles;
