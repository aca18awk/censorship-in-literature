import { loadAndProcessData } from "./loadAndProcessData.js";
import { drawChoroplethMap } from "./choroplethMap.js";
import { drawLineGraph } from "./lineGraph.js";

const svgMap = d3.select("svg");
const svgLineGraph = d3.select("svg.lineGraph");

let countries;
let selectedCountries = [];

const isCountrySelected = (name) =>
  selectedCountries.length > 0
    ? selectedCountries.find((country) => country.name === name)
    : false;

const onClick = (d) => {
  const name = d.properties.name;
  if (isCountrySelected(name)) {
    selectedCountries = selectedCountries.filter((el) => el.name !== name);
  } else {
    selectedCountries.push(d.properties);
  }
  updateVis();
};

const updateVis = () => {
  svgMap.call(drawChoroplethMap, {
    countries,
    onClick,
    isCountrySelected,
    isAnyCountrySelected: selectedCountries.length > 0,
  });

  if (selectedCountries.length > 0) {
    svgLineGraph.call(drawLineGraph, {
      data: selectedCountries,
      margin: { top: 80, bottom: 40, left: 90, right: 40 },
      xValue: (d) => new Date(d.year, 0),
      yValue: (d) => d.count,
      title: `Number of books banned over the years`,
    });
  }
  // TODO: display message: "Select country to see the visualisation"
};

loadAndProcessData().then((loadedData) => {
  countries = loadedData;
  updateVis();
});
