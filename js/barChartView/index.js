import { createBarChart } from "./barChart.js";
import { dropdownMenu } from "../dropdownMenu.js";
import { LOCATIONS, LOCATIONS_OPTIONS } from "../constants.js";
import { drawMap } from "../worldMap.js";

// Global/state variables
let plot_data;
let all_data;
let countries;
const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");

const mapSvg = d3
  .select("svg.mapSvg")
  .attr("width", +document.documentElement.clientWidth * 0.35 - 30);

// filters data by the location and author selected
const filterData = () => {
  // filters are stored in sessionStorage enabling filtering across views
  const locationSelected = sessionStorage.getItem("location");
  const authorSelected = sessionStorage.getItem("author");

  if (locationSelected) {
    plot_data = all_data.filter(
      (d) =>
        d.banned_in.filter((ban) => ban.location === locationSelected).length >
        0
    );
  } else plot_data = all_data;

  if (authorSelected) {
    const filtered = plot_data.filter((d) => d.author === authorSelected);
    // when selected author is not banned in the newly selected country,
    // reset the author selection
    if (filtered.length === 0) {
      sessionStorage.removeItem("author");
    } else {
      plot_data = filtered;
    }
  }

  // check if book is in the filtered data
  const book = JSON.parse(sessionStorage.getItem("book"));
  const isSelected = plot_data.find(
    (d) => d.author === book?.author && d.title === book?.title
  );
  if (!isSelected) sessionStorage.removeItem("book");
  updateBookDetails();
};

// returns the options for the authors dropdown
const getAuthorsOptions = () => {
  // remove duplicated authors by converting it to a set and back to an array
  let authors = [...new Set(plot_data.map((d) => d.author))];
  return [
    { name: "All authors", value: "All authors" },
    ...authors.map((d) => ({
      name: d,
      value: d,
    })),
    // only show 1000 options in the dropdown to avoid performance issues
  ].slice(0, 1000);
};

const isBookSelected = (book) => {
  const selected = JSON.parse(sessionStorage.getItem("book"));
  return (
    selected && selected.title === book.title && selected.author === book.author
  );
};

// updates the details of the book selected
const updateBookDetails = () => {
  const book = JSON.parse(sessionStorage.getItem("book"));
  if (book) {
    d3.select("#book_info").html(`
    <div class="book_title">"${
      book.title
    }" <br/> <span class="book_author"> by ${book.author}</span> </div>
    <div class="book_location"><i>Was banned <b>${book.count}</b> times in ${
      book.banned_in.length
    } countries:</i>
    <ul>
    ${book.banned_in
      .map((country) => `<li>${country.location}: ${country.count} times</li>`)
      .join("")}
  </ul>
  </div>
  `);
  }
  //if no book selected, displays the legend
  else
    d3.select("#book_info").html(`
  <div class="book_title">The most banned books</div>
  <div class="information"> 
  <p> The data has been taken from <a href="https://www.kasselerliste.com/die-kasseler-liste/"> Die Kasseler Liste </a> database. </p>
  <p>The books are displayed from the most banned. To see more information, hover or click on the book of the shelf. </p>
  <p> You can filter the data by location and by the name of the author. </p>
  <p> To see the information about the author, select them and go to "The most censored Authors" tab. </p>
</div>
`);
};

const onBookSelected = (book) => {
  if (isBookSelected(book)) {
    sessionStorage.removeItem("book");
  } else {
    sessionStorage.setItem("book", JSON.stringify(book));
  }

  updateBookDetails();
  updateVis();
};

const onAuthorSelected = (name) => {
  if (name === "All authors") sessionStorage.removeItem("author");
  else {
    sessionStorage.setItem("author", name);
  }

  filterData();
  updateVis();
};

const onLocationSelected = (event) => {
  if (event.target.value === "All countries")
    sessionStorage.removeItem("location");
  else {
    sessionStorage.setItem("location", event.target.value);
  }

  filterData();
  updateVis();
};

const updateVis = () => {
  // create dropdown menus
  dropdownMenu(d3.select("#location_menu"), {
    options: LOCATIONS_OPTIONS,
    onOptionSelected: onLocationSelected,
    selected: sessionStorage.getItem("location"),
  });

  dropdownMenu(d3.select("#author_menu"), {
    options: getAuthorsOptions(),
    onOptionSelected: (event) => onAuthorSelected(event.target.value),
    selected: sessionStorage.getItem("author"),
  });

  // add barChart plot
  svg.call(createBarChart, {
    data: plot_data.slice(0, 100),
    width,
    height,
    onBookSelected,
    isBookSelected,
  });

  // if book is selected, add map chart to show the location where it was banned
  const book = JSON.parse(sessionStorage.getItem("book"));
  if (book) {
    mapSvg.style("display", "inline");
    mapSvg.call(drawMap, {
      countries,
      mapData: book.banned_in.map((country) => country.location),
    });
  } else {
    mapSvg.style("display", "none");
  }
};

// Data loading, preprocessing, and init visualisation
Promise.all([
  d3.csv("./data/all_books.csv"),
  d3.json("./data/countries_topology.json"),
]).then(([loadedData, topoData]) => {
  // data parsing
  let processedData = [];
  loadedData.forEach((book) => {
    // for each book, only add the countries the book was banned in
    let banned_in = [];
    LOCATIONS.forEach((location) => {
      if (book[location]) {
        banned_in.push({
          location,
          count: book[location],
        });
      }
    });

    processedData.push({
      author: book.author,
      count: +book.count,
      title: book.title,
      banned_in,
    });
  });

  all_data = processedData;
  plot_data = processedData;
  countries = topojson.feature(topoData, topoData.objects.countries);

  filterData();
  updateBookDetails();

  // Init visualisation
  updateVis();
});
