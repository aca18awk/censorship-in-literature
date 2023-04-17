import { loadAndProcessData, createLineData } from "./dataHelpers.js";
import { drawChoroplethMap } from "./choroplethMap.js";
import { drawLineGraph } from "./lineGraph.js";
import { LOCATIONS_OPTIONS } from "../constants.js";
import { dropdownMenu } from "../dropdownMenu.js";
import { addMapLegend } from "./mapLegend.js";
import { addOptionButton, removeButton } from "./locationButton.js";
import { COLOUR_NUMERICAL_ARRAY_4 } from "../colourPallete.js";

const selectedOptions = document.querySelector(".selected-options");

// get svgs
const svgMap = d3
  .select("svg")
  .attr("width", +document.documentElement.clientWidth * 0.6)
  .attr("height", +document.documentElement.clientHeight * 0.75);
const svgLineGraph = d3
  .select("svg.lineGraph")
  .attr("width", +document.documentElement.clientWidth * 0.3)
  .attr("height", +document.documentElement.clientHeight * 0.75);

let all_data;
let plot_data = [];
let lastLocationSelected = "All countries";
let colourScale;

// define event listener to add interactivity for country buttons
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

// used on selection of the country from the dropdown and from the map
const onCountrySelected = (name, countryProps = null) => {
  if (isCountrySelected(name)) {
    unselectCountry(name);
  } else {
    // can plot up to 8 countries
    if (plot_data.length >= 8) {
      alert("You can only select 8 countries");
    } else {
      if (!countryProps) {
        countryProps = all_data.features.find(
          (d) => d.properties.name === name
        )?.properties;
      }
      // only add country to the chart if it has years array
      if (countryProps.years.length > 0) {
        lastLocationSelected = name;
        plot_data.push(countryProps);
        addOptionButton(name, selectedOptions);
      } else {
        alert("Not enough detailed data to plot");
      }
    }
  }

  updateVis();
};

const updateVis = () => {
  // create location dropdown menu
  dropdownMenu(d3.select("#location_menu"), {
    options: LOCATIONS_OPTIONS,
    onOptionSelected: (event) => onCountrySelected(event.target.value),
    selected: lastLocationSelected,
  });

  // draw the map
  svgMap.call(drawChoroplethMap, {
    countries: all_data,
    onClick: (d) => onCountrySelected(d.properties.name, d.properties),
    isCountrySelected,
    isAnyCountrySelected: plot_data.length > 0,
    colourScale,
  });

  // add the legend to the map
  svgMap.call(addMapLegend, {
    colourScale,
  });

  // only draw the graph if the selected countries have data to be displayed on the graph
  if (plot_data.length > 0) {
    // process the data for the lineChart
    const [lineData, minYear, maxYear, maxCount] = createLineData(plot_data);
    d3.select("div#hidden_information").style("display", "none");
    svgLineGraph.style("display", "block");
    svgLineGraph.call(drawLineGraph, {
      lineData,
      minYear,
      maxYear,
      maxCount,
      margin: { top: 10, bottom: 120, left: 60, right: 40 },
      yValue: (d) => new Date(d.year, 0),
      xValue: (d) => d.count,
    });
  } else {
    // hide the graph if there's no data to display
    d3.select("div#hidden_information").style("display", "inline");
    svgLineGraph.style("display", "none");
  }
};

loadAndProcessData().then((loadedData) => {
  all_data = loadedData;

  // define colour scale
  const countExtent = d3.extent(all_data.features, (d) => d.properties.count);

  // because only a few countries has values above 30000 and majority of them is from 0 until 500,
  // I defined the colour scale to help differentiate between the most common values
  colourScale = d3
    .scaleLinear()
    .domain([countExtent[0], 100, 500, countExtent[1]])
    .range(COLOUR_NUMERICAL_ARRAY_4);

  updateVis();
});
