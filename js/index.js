import { createBubbleChart } from "./stopSign.js";
import { dropdownMenu } from "./dropdownMenu.js";

// const svg = d3.select("svg");

// Global/state variables
let data;
const no_of_results_options = [
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
const margin = { top: 0, bottom: 0, left: 0, right: 0 };
const width = +svg.attr("width");
const height = +svg.attr("height");

const xScale = d3
  .scaleLinear()
  .domain([0, 1])
  .range([margin.left, width - margin.right]);

const yScale = d3
  .scaleLinear()
  .domain([0, 1])
  .range([margin.top, height - margin.bottom]);

const countAccessor = (d) => d.count;
const circleSize = { min: 3, max: 30 };

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
    data: data.slice(0, no_of_results_selected),
    width,
    height,
    xScale,
  });
};

// Data loading, preprocessing, and init visualisation
d3.csv("./data/forbidden1000.csv").then((loadedData) => {
  data = loadedData;
  const circleRadiusScale = d3
    .scaleSqrt()
    .domain(d3.extent(data, countAccessor))
    .range([circleSize.min, circleSize.max]);
  // Data parsing
  data.forEach((d) => {
    d.count = +d.count;
    d.x = xScale(Math.min(Math.max(d3.randomNormal(0.5, 0.1)(), 0), 1));
    d.y = yScale(Math.min(Math.max(d3.randomNormal(0.5, 0.15)(), 0), 1));
    d.r = circleRadiusScale(d.count);
    d.isPointOnCircle = Math.random() < 0.8;
  });

  // Calculate counts per each of the difficulty levels
  // difficultyLevels.forEach((level) => {
  //   const count = data.filter((d) => d.difficulty == level).length;
  //   dataBars.push({ level: level, count: count });
  // });

  // Init visualisation
  updateVis();
});
