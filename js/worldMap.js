import { COLOUR_NO_DATA, COLOUR_BOOK_SELECTED } from "./colourPallete.js";
export const drawMap = (parent, props) => {
  const { countries, mapData } = props;

  const width = +parent.attr("width");
  const height = +parent.attr("height");

  // // Define projection and pathGenerator
  const projection = d3
    .geoMercator()
    .center([0, 15])
    .scale([width / (2 * Math.PI)]) // scale to fit group width
    .translate([width / 2, height / 2]);
  const pathGenerator = d3.geoPath().projection(projection);

  const mapArea = parent.selectAll(".mapArea").data([null]);
  const mapAreaEnter = mapArea.enter().append("g").attr("class", "mapArea");

  // Zoom interactivity
  mapAreaEnter.call(
    d3
      .zoom()
      .scaleExtent([1, 8])
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .on("zoom", (event) =>
        mapAreaEnter.merge(mapArea).attr("transform", event.transform)
      )
  );

  // Earth's border
  mapAreaEnter
    .append("path")
    .attr("class", "sphere")
    .attr("d", pathGenerator({ type: "Sphere" }));

  // Paths for countries
  const allCountries = mapAreaEnter
    .merge(mapArea)
    .selectAll(".country")
    .data(countries.features);

  const allCountriesEnter = allCountries.enter().append("path");

  allCountriesEnter
    .merge(allCountries)
    .attr("class", "country")
    .attr("d", pathGenerator)
    .attr("fill", (d) =>
      mapData.includes(d.properties.name)
        ? COLOUR_BOOK_SELECTED
        : COLOUR_NO_DATA
    )
    .style("opacity", 1);

  // Tooltip event listeners
  const tooltipPadding = 15;

  allCountriesEnter
    .on("mouseover", (event, d) => {
      d3
        .select("#tooltip")
        .style("display", "block")
        .style("left", event.pageX + tooltipPadding + "px")
        .style("top", event.pageY + tooltipPadding + "px").html(`
              <div class="tooltip-title">${d.properties.name}</div>
            `);
    })
    .on("mouseleave", () => {
      d3.select("#tooltip").style("display", "none");
    });
};
