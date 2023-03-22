import { createBubbleChart } from "./stopSign.js";
import { dropdownMenu } from "./dropdownMenu.js";
import {
  no_of_results_options,
  locations,
  locations_options,
} from "./constants.js";

// Global/state variables
let data;
let all_data;
let no_of_results_selected = "300";
let location_selected = "All countries";

const svg = d3.select("svg");
// .attr("width", +document.documentElement.clientWidth)
// .attr("height", +document.documentElement.clientHeight);
const width = +svg.attr("width");
const height = +svg.attr("height");

const xScale = d3.scaleLinear().domain([0, 1]).range([0, width]);

const yScale = d3.scaleLinear().domain([0, 1]).range([0, height]);

const countAccessor = (d) => d.count;
const circleSize = { min: 3, max: 30 };

// Function(s) triggered by event listeners
const onNoOfResultsSelected = (event) => {
  no_of_results_selected = event.target.value;
  updateVis();
};

const onLocationSelected = (event) => {
  location_selected = event.target.value;

  if (location_selected === "All countries") {
    data = all_data;
  } else {
    data = all_data.filter(
      (d) =>
        d.banned_in.filter((ban) => ban.location === location_selected).length >
        0
    );
  }
  updateVis();
};

const updateVis = () => {
  dropdownMenu(d3.select("#number_of_results_menu"), {
    options: no_of_results_options,
    onOptionSelected: onNoOfResultsSelected,
    selected: no_of_results_selected,
  });

  dropdownMenu(d3.select("#location_menu"), {
    options: locations_options,
    onOptionSelected: onLocationSelected,
    selected: location_selected,
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
d3.csv("./data/authors_all.csv").then((loadedData) => {
  const circleRadiusScale = d3
    .scaleSqrt()
    .domain(d3.extent(loadedData, countAccessor))
    .range([circleSize.min, circleSize.max]);

  // Data parsing
  let processedData = [];
  loadedData.forEach((d) => {
    let location = [];
    locations.forEach((l) => {
      if (d[l]) {
        location.push({
          location: l,
          count: d[l],
        });
      }
    });
    processedData.push({
      author: d.author,
      count: +d.count,
      all_works_forbidden: d.all_works_forbidden === "TRUE" ? true : false,
      multiple_works_forbidden:
        d.multiple_works_forbidden === "TRUE" ? true : false,
      x: xScale(Math.min(Math.max(d3.randomNormal(0.5, 0.1)(), 0), 1)),
      y: yScale(Math.min(Math.max(d3.randomNormal(0.5, 0.15)(), 0), 1)),
      r: circleRadiusScale(d.count),
      isPointOnCircle: Math.random() < 0.8,
      banned_in: location,
    });
  });
  all_data = processedData;
  data = processedData;

  // Init visualisation
  updateVis();
});
