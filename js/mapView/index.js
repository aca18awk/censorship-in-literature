import { loadAndProcessData } from "./loadAndProcessData.js";
import { drawChoroplethMap } from "./choroplethMap.js";
import { drawLineGraph } from "./lineGraph.js";
import { LOCATIONS_OPTIONS } from "../constants.js";
import { dropdownMenu } from "../dropdownMenu.js";
import { addMapLegend } from "./mapLegend.js";
import { addOptionButton, removeButton } from "../locationButton.js";
import { COLOUR_NUMERICAL_ARRAY_4 } from "../colourPallete.js";

const selectedOptions = document.querySelector(".selected-options");
const svgMap = d3.select("svg");
const svgLineGraph = d3.select("svg.lineGraph");

let all_data;
let plot_data = [];
let lastLocationSelected = "All countries";
let colourScale;

selectedOptions.addEventListener("click", (event) => {
  if (event.target.tagName === "BUTTON") {
    const button = event.target;
    const optionValue = button.getAttribute("data-value");

    removeButton(button, optionValue);

    plot_data = plot_data.filter((el) => el.name !== optionValue);
    updateVis();
  }
});

const isCountrySelected = (name) =>
  plot_data.length > 0
    ? plot_data.find((country) => country.name === name)
    : false;

const unselectCountry = (country) => {
  plot_data = plot_data.filter((el) => el.name !== country);
  const button = document.querySelector(`button[data-value="${country}"]`);
  removeButton(button, country);
};

const onMapClick = (d) => {
  const country = d.properties.name;

  if (isCountrySelected(country)) {
    unselectCountry(country);
  } else {
    addOptionButton(country, selectedOptions);
    plot_data.push(d.properties);
  }
  updateVis();
};

const onDropdownOptionSelected = (event) => {
  const country = event.target.value;

  if (isCountrySelected(country)) {
    unselectCountry(country);
  } else {
    addOptionButton(country, selectedOptions);
    lastLocationSelected = country;
    const selectedCountryData = all_data.features.find(
      (d) => d.properties.name === country
    );
    plot_data.push(selectedCountryData.properties);
  }

  updateVis();
};

const updateVis = () => {
  // create location dropdown menu
  dropdownMenu(d3.select("#location_menu"), {
    options: LOCATIONS_OPTIONS,
    onOptionSelected: onDropdownOptionSelected,
    selected: lastLocationSelected,
  });

  // draw the map
  svgMap.call(drawChoroplethMap, {
    countries: all_data,
    onClick: onMapClick,
    isCountrySelected,
    isAnyCountrySelected: plot_data.length > 0,
    colourScale,
  });

  // add the legend to the map
  svgMap.call(addMapLegend, {
    colourScale,
  });

  // TODO: add max no of countries to display
  // only draw the graph if the selected countries have data to be displayed on the graph
  const lineChartData = plot_data.filter((country) => country.years.length > 0);
  if (lineChartData.length > 0) {
    svgLineGraph.style("display", "inline");
    svgLineGraph.call(drawLineGraph, {
      data: lineChartData,
      margin: { top: 10, bottom: 100, left: 60, right: 40 },
      yValue: (d) => new Date(d.year, 0),
      xValue: (d) => d.count,
    });
  } else {
    // hide the graph if there's no data to display
    svgLineGraph.style("display", "none");
  }
};

loadAndProcessData().then((loadedData) => {
  all_data = loadedData;

  // define colour scale
  const countExtent = d3.extent(all_data.features, (d) => d.properties.count);

  colourScale = d3
    .scaleLinear()
    .domain([countExtent[0], 100, 500, countExtent[1]])
    .range(COLOUR_NUMERICAL_ARRAY_4);

  updateVis();
});
