export const drawChoroplethMap = (parent, props) => {
  const { countries, onClick, isCountrySelected, isAnyCountrySelected } = props;

  const colourScale = d3
    .scaleSequential()
    .domain(d3.extent(countries.features, (d) => d.properties.count))
    .interpolator(d3.interpolateReds);

  const width = +parent.attr("width");
  const height = +parent.attr("height");

  // // Define projection and pathGenerator
  const projection = d3.geoEquirectangular();
  const pathGenerator = d3.geoPath().projection(projection);

  const mapArea = parent.selectAll(".mapArea").data([null]);
  const mapAreaEnter = mapArea.enter().append("g").attr("class", "mapArea");

  // Zoom interactivity (using d3-zoom package -- standard d3 bundle)
  mapAreaEnter.call(
    d3
      .zoom()
      .scaleExtent([1, 8])
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .on("zoom", (event) => mapAreaEnter.attr("transform", event.transform))
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

  const countriesEnter = allCountries.enter().append("path");

  countriesEnter
    .merge(allCountries)
    .attr("class", "country")
    .attr("d", pathGenerator)
    .attr("fill", (d) =>
      d.properties.count ? colourScale(d.properties.count) : "#7a7a7a"
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

  // Tooltip event listeners
  const tooltipPadding = 15;

  countriesEnter
    // Set the cursor style to "pointer" for countries with data
    .attr("cursor", (d) => (d.properties.count ? "pointer" : "default"))
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
    })
    .on("click", (_, d) => {
      // can only select countries with data available
      if (d.properties.count) {
        onClick(d);
      }
    });
};
