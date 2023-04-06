import { COLOUR_NO_DATA } from "../colourPallete.js";
export const drawChoroplethMap = (parent, props) => {
  const {
    countries,
    onClick,
    isCountrySelected,
    isAnyCountrySelected,
    colourScale,
  } = props;

  const width = +parent.attr("width");
  const height = +parent.attr("height");

  // // Define projection and pathGenerator
  const projection = d3
    .geoEquirectangular()
    .center([0, 15]) // set centre to further North
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
      d.properties.count ? colourScale(d.properties.count) : COLOUR_NO_DATA
    )
    .style("stroke-width", (d) =>
      isCountrySelected(d.properties.name) ? 1.5 : 0.1
    )
    .style("stroke", (d) =>
      isCountrySelected(d.properties.name) ? "black" : "white"
    )
    .style("opacity", (d) =>
      isAnyCountrySelected && !isCountrySelected(d.properties.name) ? 0.6 : 1
    );

  // interactivity events
  allCountriesEnter
    // Set the cursor style to "pointer" for countries with data
    .attr("cursor", (d) => (d.properties.count ? "pointer" : "default"))
    .on("click", (_, d) => {
      // can only select countries with data available
      if (d.properties.count) {
        onClick(d);
      }
    });

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
            <div>${
              d.properties.count ? d.properties.count : "No data available"
            } </div>
          `);
    })
    .on("mouseleave", () => {
      d3.select("#tooltip").style("display", "none");
    });
};
