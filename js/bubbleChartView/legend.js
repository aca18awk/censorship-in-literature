import {
  COLOUR_ALL_BOOKS_BANNED,
  COLOUR_MULTIPLE_BOOKS_BANNED,
} from "../colourPallete.js";

export const addLegend = (parent, props) => {
  const { colourScale, circleRadiusScale, legendTitle } = props;

  const legendWidth = 250;
  // Create legend group to append our legend
  // const legendGroup = parent.append("g").attr("class", "legend");
  const legend = parent.selectAll(".legend").data([null]);
  const legendGroup = legend.enter().append("g").attr("class", "legend");

  // Legend title
  legendGroup
    .append("text")
    .attr("class", "legend-title")
    .attr("y", 0)
    .text(legendTitle);

  // Legend labels
  const legendPoints = [
    {
      legend: 9,
      cx: 0,
      cy: 40,
      r: circleRadiusScale(9),
      fill: colourScale(9),
    },
    {
      legend: 55.7,
      cx: legendWidth / 3,
      cy: 40,
      r: circleRadiusScale(55.7),
      fill: colourScale(55.7),
    },
    {
      legend: 106.6,
      cx: (2 * legendWidth) / 3,
      cy: 40,
      r: circleRadiusScale(106.6),
      fill: colourScale(106.6),
    },
    {
      legend: 155,
      cx: legendWidth,
      cy: 40,
      r: circleRadiusScale(155),
      fill: colourScale(155),
    },
    {
      legend: "Some countries banned all positions of this author",
      cx: 0,
      cy: 120,
      r: circleRadiusScale(25),
      fill: COLOUR_ALL_BOOKS_BANNED,
    },
    {
      legend: "Some countries banned multiple positions of this author",
      cx: 0,
      cy: 150,
      r: circleRadiusScale(25),
      fill: COLOUR_MULTIPLE_BOOKS_BANNED,
    },
  ];

  // draw guide circles
  const circleGroups = legendGroup
    .selectAll(".legend-circle")
    .data(legendPoints)
    .enter()
    .append("g");

  circleGroups
    .append("circle")
    .attr("cx", (d) => d.cx)
    .attr("cy", (d) => d.cy)
    .attr("r", (d) => d.r)
    .style("fill", (d) => d.fill);

  const getTextPosition = (i) => {
    if (i < 4) {
      return [Math.round((legendWidth * i) / 3), 95];
    } else if (i === 4) {
      return [35, 125];
    }
    return [35, 155];
  };

  circleGroups
    .append("text")
    .attr("class", "legend-label")
    .attr("text-anchor", (_, i) => (i < 4 ? "middle" : "left"))
    .attr("x", (_, i) => getTextPosition(i)[0])
    .attr("y", (_, i) => getTextPosition(i)[1])
    .text((d) => d.legend);
};
