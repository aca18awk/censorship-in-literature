export const drawBookshelf = (
  chartEnter,
  margin,
  cabinetHeight,
  cabinetWidth,
  positionX
) => {
  chartEnter
    .append("rect")
    .attr("class", "bookshelf")
    .attr("x", positionX(0))
    .attr("y", margin.top + cabinetHeight - 10)
    .attr("width", cabinetWidth)
    .attr("height", 20);

  chartEnter
    .append("rect")
    .attr("class", "bookshelf")
    .attr("x", positionX(0))
    .attr("y", margin.top + 100)
    .attr("width", cabinetWidth)
    .attr("height", 10);

  chartEnter
    .append("rect")
    .attr("class", "bookshelf")
    .attr("x", positionX(0))
    .attr("y", margin.top + 210)
    .attr("width", cabinetWidth)
    .attr("height", 10);

  chartEnter
    .append("rect")
    .attr("class", "bookshelf")
    .attr("x", positionX(0))
    .attr("y", margin.top + 320)
    .attr("width", cabinetWidth)
    .attr("height", 10);

  chartEnter
    .append("rect")
    .attr("class", "bookshelf")
    .attr("x", positionX(0))
    .attr("y", margin.top + 430)
    .attr("width", cabinetWidth)
    .attr("height", 10);

  chartEnter
    .append("rect")
    .attr("class", "bookshelf")
    .attr("x", positionX(0))
    .attr("y", margin.top - 30)
    .attr("width", cabinetWidth)
    .attr("height", 20);

  chartEnter
    .append("rect")
    .attr("class", "bookshelf")

    .attr("y", margin.top - 30)
    .attr("x", margin.left - 20)
    .attr("width", 20)
    .attr("height", cabinetHeight + 50);

  chartEnter
    .append("rect")
    .attr("class", "bookshelf")
    .attr("y", margin.top - 30)
    .attr("x", margin.left + cabinetWidth)
    .attr("width", 20)
    .attr("height", cabinetHeight + 50);

  const archLength = (cabinetWidth + 40) / 9;

  const lines = [
    [0, 90],
    [archLength * 1, 80],
    [archLength * 2, 60],
    [archLength * 3, 40],
    [archLength * 4, 20],
    [archLength * 5, 20],
    [archLength * 6, 40],
    [archLength * 7, 60],
    [archLength * 8, 80],
    [archLength * 9, 90],
  ];

  const line = d3
    .line()
    .x((d) => d[0] + margin.left - 20)
    .y((d) => d[1])
    .curve(d3.curveCardinal.tension(0.5));

  const gradientStops = [
    { color: "#661b04", offset: 20 },
    { color: "#873e27", offset: 50 },
    { color: "#661b04", offset: 80 },
  ];

  // Linear gradient to be used for the legend
  const linearGradient = chartEnter
    .append("linearGradient")
    .attr("id", "legend-gradient");

  // Update gradient for legend
  linearGradient
    .selectAll("stop")
    .data(gradientStops)
    .enter()
    .append("stop")
    .attr("offset", (d) => `${d.offset}%`)
    .attr("stop-color", (d) => d.color);

  chartEnter
    .append("path")
    .datum(lines)
    .attr("id", "bookshelf-arch")
    // .attr("stroke", "url(#legend-gradient)")
    .attr("fill", "url(#legend-gradient)")
    .attr("d", line);
};
