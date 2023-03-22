// Adopted from: https://github.com/jeffreymorganio/d3-country-bubble-chart
// https://www.d3indepth.com/force-layout/
// https://observablehq.com/d/bab58bcfeea93d76
// https://stackoverflow.com/questions/51153379/getting-d3-force-to-work-in-update-pattern

export const createBubbleChart = (parent, props) => {
  // unpack my props
  let { data, width, height, xScale } = props;
  const xMiddle = width / 2;
  const yMiddle = height / 2;
  const allCounts = data
    .map((d) => d.r)
    .sort()
    .reverse();
  // TODO: choose appropriate colours
  const colorScale = d3
    .scaleSequential()
    .domain(d3.extent(data, (d) => d.r))
    .interpolator(d3.interpolateReds);

  // Chart taking care of inner margins
  const chart = parent.selectAll(".chart").data([null]);
  const chartEnter = chart.enter().append("g").attr("class", "chart");

  // TODO: fix zooming in
  parent.call(
    d3
      .zoom()
      .scaleExtent([1, 8])
      .translateExtent([
        [-0, 0],
        [width, height],
      ])
      .on("zoom", (event) => chartEnter.attr("transform", event.transform))
  );

  const circlesSign = [
    {
      cx: xMiddle,
      cy: yMiddle,
      r: Math.min(width, height) / 2.4,
    },
  ];
  // draw guide circles
  chartEnter
    .selectAll(".guide-circle")
    .data(circlesSign)
    .enter()
    .append("circle")
    .attr("cx", (d) => d.cx)
    .attr("cy", (d) => d.cy)
    .attr("r", (d) => d.r)
    .style("fill", "none")
    .style("stroke", "#C60116")
    .style("stroke-width", "80")
    .style("stroke-opacity", "0.5");

  chartEnter
    .append("line")
    .style("stroke", "#C60116")
    .style("stroke-width", "50")
    .style("stroke-opacity", "0.5")
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

  const getColour = (d) => {
    if (d.all_works_forbidden) return "#e0c600";
    if (d.multiple_works_forbidden) return "#0d9c08";
    return colorScale(d.r);
  };

  circlesEnter
    .merge(circles)
    .attr("r", (d) => d.r)
    .attr("fill", (d) => getColour(d));

  circles.exit().remove();

  var forceStrength = 0.2;

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

  // TOOLTIP EVENTS
  // TODO: display where it was banned
  const tooltipPadding = 15;
  circlesEnter
    .on("mouseover", (event, d) => {
      d3
        .select("#tooltip")
        .style("display", "block")
        .style("left", event.pageX + tooltipPadding + "px")
        .style("top", event.pageY + tooltipPadding + "px").html(`
        <div class="tooltip-title">${d.author}</div>
        <div><i>Was banned: ${d.count} times</i></div>
      `);
    })
    .on("mouseleave", () => {
      d3.select("#tooltip").style("display", "none");
    });
};
