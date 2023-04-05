export const addMapLegend = (parent, props) => {
  const { colourScale } = props;

  const ticks = colourScale.domain();
  const nTicks = ticks.length;
  const barWidth = 200;
  const barHeight = 15;
  const title = "Number of positions banned:";

  // Create legend group to append our legend
  const legend = parent.selectAll(".legend").data([null]);
  const legendGroup = legend.enter().append("g").attr("class", "legend");

  // Legend rectangle
  const legendRect = legendGroup
    .append("rect")
    .attr("width", barWidth)
    .attr("height", barHeight);

  // Legend title
  legendGroup
    .append("text")
    .attr("class", "legend-title")
    .attr("y", -10)
    .text(title);

  legendGroup
    .selectAll(".legend-label")
    .data(ticks)
    .enter()
    .append("text")
    .attr("class", "legend-label")
    .attr("text-anchor", "middle")
    .attr("y", 35)
    .attr("x", (_, i) => Math.round((barWidth * i) / (nTicks - 1)))
    .text((d) => Math.round(d * 10) / 10);

  const gradientStops = [
    { color: colourScale(ticks[0]), value: ticks[0], offset: 0 },
    { color: colourScale(ticks[3]), value: ticks[3], offset: 100 },
  ];

  // Linear gradient to be used for the legend
  const linearGradient = parent
    .append("linearGradient")
    .attr("id", "legend-gradient");

  // Update gradient for legend
  linearGradient
    .selectAll("stop")
    .data(gradientStops)
    .enter()
    .append("stop")
    .attr("offset", (d) => d.offset)
    .attr("stop-color", (d) => d.color);

  // Apply gradient to rectangle
  legendRect.attr("fill", "url(#legend-gradient)");
};
