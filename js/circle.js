// Adopted from: https://github.com/jeffreymorganio/d3-country-bubble-chart

export const createBubbleChart = (parent, props) => {
  // unpack my props
  let { data, margin } = props;

  const width = +parent.attr("width");
  const height = +parent.attr("height");
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const countAccessor = (d) => d.count;
  let circles;
  const circleSize = { min: 5, max: 50 };

  const allCounts = data.map((d) => d.count);
  const colorScale = d3.scaleOrdinal(d3.schemeReds[5]).domain(allCounts);

  const circleRadiusScale = d3
    .scaleSqrt()
    .domain(d3.extent(data, countAccessor))
    .range([circleSize.min, circleSize.max]);

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

  const xScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([margin.left, width - margin.right]);

  const yScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([height - margin.bottom - margin.top, margin.top]);

  data = data.map((d) => ({
    ...d,
    x: xScale(Math.min(Math.max(d3.randomNormal(0.5, 0.15)(), 0), 1)),
    y: yScale(Math.min(Math.max(d3.randomNormal(0.5, 0.15)(), 0), 1)),
    r: circleRadiusScale(d.count),
  }));

  // Plot data
  const points = chartEnter.merge(chart).selectAll(".bubble").data(data);
  circles = points
    .enter()
    .append("circle")
    .attr("r", (d) => circleRadiusScale(d.count))
    .attr("fill", (d) => colorScale(d.count))
    .attr("cx", (d) => (d.x ? d.x : width / 2))
    .attr("cy", (d) => (d.y ? d.y : height / 2));

  var forceStrength = 0.06;

  const forceSimulation = d3
    .forceSimulation(data)
    .force("x", d3.forceX(xScale(0.5)).strength(forceStrength))
    .force("y", d3.forceY(yScale(0.5)).strength(forceStrength))
    .force(
      "collide",
      d3.forceCollide().radius((d) => d.r + 1)
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
        <div><i>Population: ${d.count}</i></div>
      `);
    })
    .on("mouseleave", () => {
      d3.select("#tooltip").style("display", "none");
    });
};
