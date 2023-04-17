// https://d3-graph-gallery.com/graph/line_several_group.html
export const drawLineGraph = (parent, props) => {
  // unpack my props
  const { lineData, minYear, maxYear, maxCount, margin, xValue, yValue } =
    props;

  // drawing module
  const width = +parent.attr("width");
  const height = +parent.attr("height");
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // define chart area
  const chartArea = parent.selectAll(".chart").data([null]);
  const chart = chartArea
    .enter()
    .append("g")
    .attr("class", "chart")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // add zooming functionality
  parent.call(
    d3
      .zoom()
      .scaleExtent([1, 8])
      .translateExtent([
        [-margin.left, -margin.top],
        [innerWidth + margin.right, innerHeight + margin.bottom],
      ])
      .on("zoom", (event) =>
        chart.merge(chartArea).attr("transform", event.transform)
      )
  );

  // Initialise scales
  const yScale = d3
    .scaleTime()
    .domain([new Date(minYear, 0), new Date(maxYear, 0)])
    .range([0, innerHeight]);

  const xScale = d3
    .scaleLinear()
    .domain([0, maxCount])
    .range([0, innerWidth])
    .nice();

  const xAxisTicks = xScale.ticks().filter((tick) => Number.isInteger(tick));

  // Initialise axes
  const xAxis = d3
    .axisBottom(xScale)
    .tickValues(xAxisTicks)
    .tickFormat(d3.format("d"));

  const xAxisG = chartArea.select(".x-axis");
  const xAxisGEnter = chart
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${innerHeight})`);
  xAxisG.merge(xAxisGEnter).call(xAxis);

  const yAxis = d3.axisLeft(yScale).tickPadding(10);
  const yAxisG = chartArea.select(".y-axis");
  const yAxisGEnter = chart.append("g").attr("class", "y-axis");
  yAxisG.merge(yAxisGEnter).call(yAxis);

  // Plot data
  const lineGenerator = d3
    .line()
    .x((d) => xScale(xValue(d)))
    .y((d) => yScale(yValue(d)));

  const line = chart
    .merge(chartArea)
    .selectAll(".chart-line")
    // so it updates every time we remove the country
    .data(lineData, (d) => d.color.concat(d.name));

  // Update the line
  line
    .enter()
    .append("path")
    .attr("class", "chart-line")
    .attr("stroke", (d) => d.color)
    .merge(line)
    .transition()
    .duration(1000)
    .attr("d", (d) => lineGenerator(d.years));

  line.exit().remove();

  // append the legend
  const positionY = (_, i) => {
    return innerHeight + 40 + (i % 4) * 25;
  };

  const positionX = (i) => {
    return 10 + (parseInt(i / 4) * width) / 2;
  };

  const legend = parent
    .selectAll(".lineLegend")
    .data(lineData, (d) => d.color.concat(d.name));

  const legendBox = legend
    .enter()
    .append("g")
    .attr("class", "lineLegend")
    .attr(
      "transform",
      (d, i) => `translate(${positionX(i)},${positionY(d, i)})`
    );

  legendBox
    .append("text")
    .text((d) => d.name)
    .attr("transform", "translate(15,9)"); //align texts with boxes

  legendBox
    .append("rect")
    .attr("fill", (d) => d.color)
    .attr("width", 10)
    .attr("height", 10);

  legend.exit().remove();
};
