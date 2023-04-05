import { createBubbleChart } from "./bubbleChart.js";
import { dropdownMenu } from "../dropdownMenu.js";
import {
  NO_OF_RESULTS_OPTIONS,
  LOCATIONS,
  LOCATIONS_OPTIONS,
} from "../constants.js";
import { COLOUR_NUMERICAL_ARRAY_4 } from "../colourPallete.js";
import { addLegend } from "./legend.js";
import { addOptionButton, removeButton } from "../locationButton.js";

// Global/state variables
const selectedOptions = document.querySelector(".selected-options");

let plot_data;
let all_data;
let no_of_results_selected = "300";
let locations_selected = [];
let lastLocationSelected = "All countries";
let circleRadiusScale;
let colourScale;

const svg = d3.select("svg");
// .attr("width", +document.documentElement.clientWidth)
// .attr("height", +document.documentElement.clientHeight);
const width = +svg.attr("width");
const height = +svg.attr("height");

const xScale = d3.scaleLinear().domain([0, 1]).range([0, width]);
const yScale = d3.scaleLinear().domain([0, 1]).range([0, height]);

const circleSize = { min: 3, max: 30 };
const legendTitle = "Number of positions banned:";

selectedOptions.addEventListener("click", (event) => {
  if (event.target.tagName === "BUTTON") {
    const optionValue = event.target.getAttribute("data-value");
    unselectCountry(optionValue);
    updateVis();
  }
});

// Function(s) triggered by event listeners
const onNoOfResultsSelected = (event) => {
  no_of_results_selected = event.target.value;
  updateVis();
};

const isCountrySelected = (name) => locations_selected.includes(name);

const unselectCountry = (country) => {
  locations_selected = locations_selected.filter((c) => c !== country);
  if (locations_selected.length === 0) {
    plot_data = all_data;
  } else {
    plot_data = all_data.filter(
      (d) =>
        d.banned_in.filter((ban) => locations_selected.includes(ban.location))
          .length > 0
    );
  }
  const button = document.querySelector(`button[data-value="${country}"]`);
  removeButton(button, country);
};

const onLocationSelected = (event) => {
  const country = event.target.value;

  if (isCountrySelected(country)) {
    unselectCountry(country);
  } else {
    addOptionButton(country, selectedOptions);
    locations_selected.push(country);
    plot_data = all_data.filter(
      (d) =>
        d.banned_in.filter((ban) => locations_selected.includes(ban.location))
          .length > 0
    );
  }

  updateVis();
};

// const onLocationSelected = (event) => {
//   location_selected = event.target.value;

//   if (location_selected === "All countries") {
//     plot_data = all_data;
//   } else {
//     // data only contains data points from selected country
//     plot_data = all_data.filter(
//       (d) =>
//         d.banned_in.filter((ban) => ban.location === location_selected).length >
//         0
//     );
//   }
//   updateVis();
// };

const updateVis = () => {
  // create dropdown menus
  dropdownMenu(d3.select("#number_of_results_menu"), {
    options: NO_OF_RESULTS_OPTIONS,
    onOptionSelected: onNoOfResultsSelected,
    selected: no_of_results_selected,
  });

  dropdownMenu(d3.select("#location_menu"), {
    options: LOCATIONS_OPTIONS,
    onOptionSelected: onLocationSelected,
    selected: lastLocationSelected,
  });

  // create bubble chart
  svg.call(createBubbleChart, {
    data: plot_data.slice(0, no_of_results_selected),
    width,
    height,
    xScale,
    colourScale,
  });

  // create chart legend
  svg.call(addLegend, {
    colourScale,
    circleRadiusScale,
    legendTitle,
  });
};

// Data loading, preprocessing, and init visualisation
d3.csv("./data/authors_all.csv").then((loadedData) => {
  const dataExtent = d3.extent(loadedData, (d) => +d.count);

  // define scales
  circleRadiusScale = d3
    .scaleSqrt()
    .domain(dataExtent)
    .range([circleSize.min, circleSize.max]);

  colourScale = d3
    .scaleLinear()
    .domain([dataExtent[0], 20, 50, dataExtent[1]])
    .range(COLOUR_NUMERICAL_ARRAY_4);

  // data parsing
  let processedData = [];
  loadedData.forEach((author) => {
    // for each author, only add the countries they were banned in
    let banned_in = [];
    LOCATIONS.forEach((location) => {
      if (author[location]) {
        banned_in.push({
          location,
          count: +author[location],
        });
      }
    });

    processedData.push({
      author: author.author,
      count: +author.count,
      all_works_forbidden: author.all_works_forbidden === "TRUE",
      multiple_works_forbidden: author.multiple_works_forbidden === "TRUE",
      r: circleRadiusScale(+author.count),
      // random location
      x: xScale(Math.min(Math.max(d3.randomNormal(0.5, 0.1)(), 0), 1)),
      y: yScale(Math.min(Math.max(d3.randomNormal(0.5, 0.15)(), 0), 1)),

      // around 80% points are on the circle
      isPointOnCircle: Math.random() < 0.8,
      banned_in,
    });
  });

  all_data = processedData;
  plot_data = processedData;

  // Init visualisation
  updateVis();
});
