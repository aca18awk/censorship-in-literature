import { createBubbleChart } from "./bubbleChart.js";
import { dropdownMenu } from "../dropdownMenu.js";
import {
  NO_OF_RESULTS_OPTIONS,
  LOCATIONS,
  LOCATIONS_OPTIONS,
} from "../constants.js";
import { COLOUR_NUMERICAL_ARRAY_4 } from "../colourPallete.js";
import { addLegend } from "./legend.js";
import { drawMap } from "../worldMap.js";

// Global/state variables
let plot_data;
let all_data;
let no_of_results_selected = "300";
let circleRadiusScale;
let colourScale;
let authors_options;
let countries;

// get svgs
const svg = d3
  .select("svg")
  .attr("width", +document.documentElement.clientWidth * 0.6)
  .attr("height", +document.documentElement.clientHeight * 0.8);
const width = +svg.attr("width");
const height = +svg.attr("height");

const svgLegend = d3
  .select("svg.legendSvg")
  .attr("width", +document.documentElement.clientWidth * 0.3);

const mapSvg = d3
  .select("svg.mapSvg")
  .attr("width", +document.documentElement.clientWidth * 0.35 - 30)
  .attr("height", +document.documentElement.clientHeight * 0.3);

const xScale = d3.scaleLinear().domain([0, 1]).range([0, width]);
const yScale = d3.scaleLinear().domain([0, 1]).range([0, height]);

const circleSize = { min: 3, max: 30 };
const legendTitle = "Number of positions banned:";

// Function(s) triggered by event listeners
const onNoOfResultsSelected = (event) => {
  no_of_results_selected = event.target.value;
  updateVis();
};

const updateAuthorsDropdown = () => {
  authors_options = [
    { name: "All authors", value: "All authors" },
    ...plot_data.map((d) => ({
      name: d.author,
      value: d.author,
    })),
  ];
};

const filterData = () => {
  plot_data = all_data.filter(
    (d) =>
      d.banned_in.filter(
        (ban) => ban.location === sessionStorage.getItem("location")
      ).length > 0
  );
};

const isAuthorSelected = (author) =>
  author === sessionStorage.getItem("author");

// filter data and update the description
const onAuthorSelected = (name) => {
  if (name === "All authors" || name === sessionStorage.getItem("author")) {
    sessionStorage.removeItem("author");
    displayDescription();
  } else {
    sessionStorage.setItem("author", name);
    const details = all_data.find((d) => d.author === name);
    displayAuthorDetails(details);
  }
  updateVis();
};

const onLocationSelected = (event) => {
  let location_selected = event.target.value;
  if (location_selected === "All countries") {
    sessionStorage.removeItem("location");
    plot_data = all_data;
    updateAuthorsDropdown();
  } else {
    sessionStorage.setItem("location", location_selected);
    // data only contains data points from selected country
    filterData();
    updateAuthorsDropdown();
    // if country data doesn't contain selected author, remove the selection
    if (!plot_data.find((d) => d.author === sessionStorage.getItem("author")))
      onAuthorSelected("All authors");
  }
  updateVis();
};

// function to display author details
const displayAuthorDetails = (selected) => {
  d3.select("#book_info").html(`
  <div class="book_title">${selected.author}</div>
  <div class="book_location"><i>Was banned <b>${selected.count}</b> times in ${
    selected.banned_in.length
  } countries:</i>
  <ul>
  ${selected.banned_in
    .map((country) => `<li>${country.location}: ${country.count} times</li>`)
    .join("")}
</ul>
</div>
`);
};

const displayDescription = () => {
  d3.select("#book_info").html(`
  <div class="book_title">The most censored authors</div>
  <div class="information"> 
  <p> The data has been taken from <a href="https://www.kasselerliste.com/die-kasseler-liste/"> Die Kasseler Liste </a> database. </p>
  <p>Each circle represents an author. To see more information, hover or click on it. </p>
  <p> To see the books written by the author, select them and go to "The most banned books" tab. </p>
  <p> You can also filter the data by location and the number of results. </p>
</div>
`);
};

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
    selected: sessionStorage.getItem("location"),
  });

  dropdownMenu(d3.select("#author_menu"), {
    options: authors_options,
    onOptionSelected: (event) => onAuthorSelected(event.target.value),
    selected: sessionStorage.getItem("author"),
  });

  // create bubble chart
  svg.call(createBubbleChart, {
    data: plot_data.slice(0, no_of_results_selected),
    width,
    height,
    xScale,
    colourScale,
    onClick: onAuthorSelected,
    isAuthorSelected,
  });

  // create chart legend
  svgLegend.call(addLegend, {
    colourScale,
    circleRadiusScale,
    legendTitle,
  });

  // display the map of countries the author was banned in, if author is selected
  const author = sessionStorage.getItem("author");
  if (author) {
    const details = plot_data.find((d) => d.author === author);
    mapSvg.style("display", "inline");
    mapSvg.call(drawMap, {
      countries,
      mapData: details.banned_in.map((country) => country.location),
    });
  } else {
    mapSvg.style("display", "none");
  }
};

// Data loading, preprocessing, and init visualisation
Promise.all([
  d3.csv("./data/authors.csv"),
  d3.json("./data/countries_topology.json"),
]).then(([loadedData, topoData]) => {
  countries = topojson.feature(topoData, topoData.objects.countries);

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

  // apply filters if they are already selected
  if (sessionStorage.getItem("location")) filterData();

  const authorSelected = sessionStorage.getItem("author");
  if (authorSelected) {
    const details = all_data.find((d) => d.author === authorSelected);
    displayAuthorDetails(details);
  } else displayDescription();

  updateAuthorsDropdown();

  // Init visualisation
  updateVis();
});
