import { year_ban } from "../constants.js";

export const loadAndProcessData = () =>
  Promise.all([
    d3.json("./data/countries-50m.json"),
    d3.csv("./data/countries_analysis.csv"),
  ]).then(([topoData, csvData]) => {
    // Conversion from TopoJSON to GeoJSON
    const countries = topojson.feature(topoData, topoData.objects.countries);

    // Parse CSV data
    csvData.forEach((d) => {
      d.count = +d.count;
    });

    // TODO: match using coutry code, not country name
    countries.features.forEach((d) => {
      const csvObject = csvData.find((e) => e.country === d.properties.name);
      let years = [];
      year_ban.forEach((l) => {
        if (csvObject && csvObject[l]) {
          years.push({
            year: l,
            count: +csvObject[l],
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
