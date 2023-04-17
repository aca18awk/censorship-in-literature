import { YEARS_OF_BAN } from "../constants.js";
import { COLOUR_ORIDINAL_ARRAY_8 } from "../colourPallete.js";

export const loadAndProcessData = () =>
  Promise.all([
    d3.json("./data/countries_topology.json"),
    d3.csv("./data/countries.csv"),
  ]).then(([topoData, csvData]) => {
    // Conversion from TopoJSON to GeoJSON
    const countries = topojson.feature(topoData, topoData.objects.countries);

    // Parse CSV data
    csvData.forEach((d) => {
      d.count = +d.count;
    });

    // for each country add the total count of banned books and the array of years when the books were banned
    countries.features.forEach((d) => {
      const csvObject = csvData.find((e) => e.country === d.properties.name);
      let years = [];
      YEARS_OF_BAN.forEach((year) => {
        if (csvObject && csvObject[year]) {
          years.push({
            year,
            count: +csvObject[year],
          });
        }
      });
      d.properties = {
        ...d.properties,
        count: csvObject?.count,
        years: years,
      };
    });

    return countries;
  });

// function to process plot data - for each country we need data point from each year
export const createLineData = (data) => {
  let minYear, maxYear, minCount, maxCount;
  data.forEach((country) => {
    const [firstYear, lastYear] = d3.extent(country.years, (d) => d.year);
    const [countMin, countMax] = d3.extent(country.years, (d) => d.count);
    minYear = minYear ? Math.min(firstYear, minYear) : firstYear;
    maxYear = maxYear ? Math.max(maxYear, lastYear) : lastYear;
    minCount = minCount ? Math.min(countMin, minCount) : countMin;
    maxCount = maxCount ? Math.max(maxCount, countMax) : countMax;
  });

  let lineData = [];
  let coloursAvailable = COLOUR_ORIDINAL_ARRAY_8.slice().reverse();
  data.forEach((country) => {
    let years = [];
    for (let i = minYear; i <= maxYear; i++) {
      const csvObject = country.years.find((e) => e.year === String(i));
      let a = {
        year: i,
        // if the data for a given year is not available we set it to 0
        count: csvObject ? csvObject.count : 0,
      };
      years.push(a);
    }
    // we asign colour to each country at this level to make sure it won't change if we add/remove elements in the chart
    lineData.push({
      name: country.name,
      years: years,
      color: coloursAvailable.pop(),
    });
  });
  return [lineData, minYear, maxYear, maxCount];
};
