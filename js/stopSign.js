// Adopted from: https://github.com/jeffreymorganio/d3-country-bubble-chart
// https://www.d3indepth.com/force-layout/
// https://observablehq.com/d/bab58bcfeea93d76

export const createBubbleChart = (parent, props) => {
  // unpack my props
  let { data, margin, no_of_results_selected } = props;
  console.log(no_of_results_selected);
  data = data.slice(0, no_of_results_selected);
  const isPointOnCircle = (i) => i < data.length * 0.7;

  const width = +parent.attr("width");
  const height = +parent.attr("height");
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const xMiddle = width / 2 - margin.left;
  const yMiddle = height / 2 - margin.top;

  const countAccessor = (d) => d.count;
  const circleSize = { min: 3, max: 30 };

  const allCounts = data.map((d) => d.count);

  const colorScale = d3.scaleOrdinal(d3.schemeReds[5]).domain(allCounts);

  const circleRadiusScale = d3
    .scaleSqrt()
    .domain(d3.extent(data, countAccessor))
    .range([circleSize.min, circleSize.max]);

  const xScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([margin.left, width - margin.right]);

  const yScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([margin.top, height - margin.bottom]);

  data = data.map((d, i) => ({
    ...d,
    x: xScale(Math.min(Math.max(d3.randomNormal(0.5, 0.1)(), 0), 1)),
    y: yScale(Math.min(Math.max(d3.randomNormal(0.5, 0.15)(), 0), 1)),
  }));

  const getRadius = (d) => circleRadiusScale(d.count);

  // Chart taking care of inner margins
  const chart = parent.selectAll(".chart").data([null]);
  const chartEnter = chart
    .enter()
    .append("g")
    .attr("class", "chart")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  parent.call(
    d3
      .zoom()
      .scaleExtent([1, 8])
      .translateExtent([
        [-margin.left, -margin.top],
        [innerWidth + margin.right, innerHeight + margin.bottom],
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
  const points = chartEnter
    .merge(chart)
    .selectAll(".bubble")
    .data(data, (d) => d.author);
  const circles = points
    .enter()
    .append("circle")
    .attr("class", "bubble")
    .attr("r", (d) => getRadius(d))
    .attr("fill", (d) => colorScale(d.count));

  var forceStrength = 0.2;

  const forceSimulation = d3
    .forceSimulation(data)
    .force(
      "x",
      d3
        .forceX((d, i) =>
          isPointOnCircle(i)
            ? xMiddle
            : xScale(Math.min(Math.max(d3.randomNormal(0.5, 0.1)(), 0), 1))
        )
        .strength(forceStrength)
    )
    .force("y", d3.forceY(yMiddle).strength(forceStrength))
    .force(
      "collide",
      d3.forceCollide().radius((d) => getRadius(d) + 1)
    )
    .force(
      "radial",
      d3
        .forceRadial(
          (d, i) => (isPointOnCircle(i) ? Math.min(width, height) / 1.7 : 0),
          xMiddle,
          yMiddle
        )
        .strength((d, i) => (isPointOnCircle(i) ? 0.5 : 0))
    );

  // indicate how we should update the graph for each tick
  forceSimulation.on("tick", () =>
    circles.attr("cx", (d) => d.x).attr("cy", (d) => d.y)
  );

  // TOOLTIP EVENTS
  const tooltipPadding = 15;
  circles
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
