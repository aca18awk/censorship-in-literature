import { createBarChart } from "./barChart.js";

import { dropdownMenu } from "../dropdownMenu.js";
import {
  NO_OF_RESULTS_OPTIONS,
  LOCATIONS,
  LOCATIONS_OPTIONS,
} from "../constants.js";

// Global/state variables
let colourScale;
let plot_data;
let all_data;
let no_of_results_selected = "100";
let location_selected = sessionStorage.getItem("location") ?? "All countries";
const svg = d3.select("svg");
// .attr("width", +document.documentElement.clientWidth)
// .attr("height", +document.documentElement.clientHeight);
const width = +svg.attr("width");
const height = +svg.attr("height");

const xScale = d3.scaleLinear().domain([0, 1]).range([0, width]);

const filterData = () => {
  plot_data = all_data.filter(
    (d) =>
      d.banned_in.filter((ban) => ban.location === location_selected).length > 0
  );
};

// Function(s) triggered by event listeners
const onLocationSelected = (event) => {
  location_selected = event.target.value;
  sessionStorage.setItem("location", location_selected);
  if (location_selected === "All countries") {
    plot_data = all_data;
  } else {
    // data only contains data points from selected country
    filterData();
  }
  updateVis();
};

const updateVis = () => {
  // create dropdown menus
  // dropdownMenu(d3.select("#number_of_results_menu"), {
  //   options: NO_OF_RESULTS_OPTIONS,
  //   onOptionSelected: onNoOfResultsSelected,
  //   selected: no_of_results_selected,
  // });

  dropdownMenu(d3.select("#location_menu"), {
    options: LOCATIONS_OPTIONS,
    onOptionSelected: onLocationSelected,
    selected: location_selected,
  });

  // refresh scatterplot
  svg.call(createBarChart, {
    data: plot_data.slice(0, no_of_results_selected),
    width,
    height,
    colourScale,
  });
};

// Data loading, preprocessing, and init visualisation
d3.csv("./data/all_books.csv").then((loadedData) => {
  // data parsing
  let processedData = [];
  loadedData.forEach((author) => {
    // for each author, only add the countries they were banned in
    let banned_in = [];
    LOCATIONS.forEach((location) => {
      if (author[location]) {
        banned_in.push({
          location,
          count: author[location],
        });
      }
    });

    processedData.push({
      author: author.author,
      count: +author.count,
      title: author.title,
      banned_in,
    });
  });

  all_data = processedData;
  plot_data = processedData;

  // TODO: choose appropriate colours
  colourScale = d3
    .scaleSequential()
    .domain(d3.extent(plot_data, (d) => d.count))
    .interpolator(d3.interpolateReds);

  if (location_selected !== "All countries") filterData();

  // Init visualisation
  updateVis();
});
