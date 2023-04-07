// Adopted from: https://github.com/jeffreymorganio/d3-country-bubble-chart
// https://www.d3indepth.com/force-layout/
// https://observablehq.com/d/bab58bcfeea93d76
// https://stackoverflow.com/questions/51153379/getting-d3-force-to-work-in-update-pattern

import {
  COLOUR_ALL_BOOKS_BANNED,
  COLOUR_MULTIPLE_BOOKS_BANNED,
} from "../colourPallete.js";
export const createBubbleChart = (parent, props) => {
  let { data, width, height, xScale, colourScale, onClick, isAuthorSelected } =
    props;

  const xMiddle = width / 2;
  const yMiddle = height / 2;

  const getBubbleColour = (d) => {
    if (d.all_works_forbidden) return COLOUR_MULTIPLE_BOOKS_BANNED;
    if (d.multiple_works_forbidden) return COLOUR_ALL_BOOKS_BANNED;
    return colourScale(d.count);
  };

  // Chart area
  const chart = parent.selectAll(".bubbleChart").data([null]);
  const chartEnter = chart.enter().append("g").attr("class", "bubbleChart");

  // support zooming in
  parent.call(
    d3
      .zoom()
      .scaleExtent([1, 8])
      .translateExtent([
        [-0, 0],
        [width, height],
      ])
      .on("zoom", (event) =>
        chartEnter.merge(chart).attr("transform", event.transform)
      )
  );

  // draw "no entry" sign outline
  chartEnter
    .append("circle")
    .attr("class", "sign")
    .attr("cx", xMiddle)
    .attr("cy", yMiddle)
    .attr("r", Math.min(width, height) / 2.4)
    .style("stroke-width", "80");

  chartEnter
    .append("line")
    .attr("class", "sign")
    .style("stroke-width", "50")
    .attr("x1", xMiddle - Math.min(width, height) / 2.4 + 40)
    .attr("y1", yMiddle)
    .attr("x2", xMiddle + Math.min(width, height) / 2.4 - 40)
    .attr("y2", yMiddle);

  // Plot data
  const circles = chartEnter
    .merge(chart)
    .selectAll(".bubble")
    .data(data, (d) => d.author);
  const circlesEnter = circles.enter().append("circle").attr("class", "bubble");

  circlesEnter
    .merge(circles)
    .attr("r", (d) => d.r)
    .attr("fill", (d) => getBubbleColour(d))
    .style("stroke-width", (d) => (isAuthorSelected(d.author) ? 3 : 1.5))
    .style("stroke", (d) => (isAuthorSelected(d.author) ? "black" : "white"));

  circles.exit().remove();

  const forceStrength = 0.2;

  // add force simulation to move circles into the no entry sign shape
  d3.forceSimulation(data)
    .force(
      "x",
      d3
        .forceX((d) =>
          d.isPointOnCircle
            ? xMiddle
            : xScale(Math.min(Math.max(d3.randomNormal(0.5, 0.1)(), 0), 1))
        )
        .strength(forceStrength)
    )
    .force("y", d3.forceY(yMiddle).strength(forceStrength))
    .force(
      "collide",
      d3.forceCollide().radius((d) => d.r + 1)
    )
    .force(
      "radial",
      d3
        .forceRadial(
          (d) => (d.isPointOnCircle ? Math.min(width, height) / 1.7 : 0),
          xMiddle,
          yMiddle
        )
        .strength((d) => (d.isPointOnCircle ? 0.5 : 0))
    )
    .on("tick", () => {
      chartEnter
        .merge(chart)
        .selectAll(".bubble")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y);
    });

  // TODO: on click bigger the border of the circle
  // TODO: on click save the filter and display it
  // TODO: on double-click remove the filter
  // TODO: display the map?
  circlesEnter
    .attr("cursor", (d) => "pointer")
    .on("click", (event, d) => {
      onClick(d.author);
    });
  // Tooltip event
  const tooltipPadding = 15;
  circlesEnter
    .on("mouseover", (event, d) => {
      d3
        .select("#tooltip")
        .style("display", "block")
        .style("left", event.pageX + tooltipPadding + "px")
        .style("top", event.pageY + tooltipPadding + "px").html(`
        <div class="tooltip-title">${d.author}</div>
        <i>Was banned <b>${d.count}</b> times </i> `);
    })
    .on("mouseleave", () => {
      d3.select("#tooltip").style("display", "none");
    });
};
