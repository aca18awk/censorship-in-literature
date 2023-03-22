import { createBubbleChart } from "./stopSign.js";
import { dropdownMenu } from "./dropdownMenu.js";

// const svg = d3.select("svg");

// Global/state variables
let data;
let no_of_results_options = [
  {
    name: "top 100",
    value: "100",
  },
  {
    name: "top 200",
    value: "200",
  },
  {
    name: "top 300",
    value: "300",
  },
  {
    name: "top 500",
    value: "500",
  },
  {
    name: "top 1000",
    value: "1000",
  },
];
let no_of_results_selected = "300";

const svg = d3.select("svg");
// .attr("width", +document.documentElement.clientWidth)
// .attr("height", +document.documentElement.clientHeight);

// Function(s) triggered by event listeners
const onNoOfResultsSelected = (event) => {
  no_of_results_selected = event.target.value;
  updateVis();
};

const updateVis = () => {
  dropdownMenu(d3.select("#number_of_results_menu"), {
    options: no_of_results_options,
    onOptionSelected: onNoOfResultsSelected,
    selected: no_of_results_selected,
  });

  // refresh scatterplot
  svg.call(createBubbleChart, {
    data: data,
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
    no_of_results_selected,
  });
};

// Data loading, preprocessing, and init visualisation
d3.csv("./data/forbidden1000.csv").then((loadedData) => {
  data = loadedData;
  // Data parsing
  data.forEach((d) => {
    d.count = +d.count;
  });

  // Calculate counts per each of the difficulty levels
  // difficultyLevels.forEach((level) => {
  //   const count = data.filter((d) => d.difficulty == level).length;
  //   dataBars.push({ level: level, count: count });
  // });

  // Init visualisation
  updateVis();
});
