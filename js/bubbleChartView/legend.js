import {
  COLOUR_ALL_BOOKS_BANNED,
  COLOUR_MULTIPLE_BOOKS_BANNED,
  COLOUR_SELECTED_AUTHOR,
} from "../colourPallete.js";

export const addLegend = (parent, props) => {
  const { colourScale, circleRadiusScale, legendTitle } = props;

  const legendWidth = 250;
  // Create legend group to append the legend
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
      legend: 55,
      cx: legendWidth / 3,
      cy: 40,
      r: circleRadiusScale(55),
      fill: colourScale(55),
    },
    {
      legend: 107,
      cx: (2 * legendWidth) / 3,
      cy: 40,
      r: circleRadiusScale(107),
      fill: colourScale(107),
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
      cy: 110,
      r: circleRadiusScale(25),
      fill: COLOUR_ALL_BOOKS_BANNED,
    },
    {
      legend: "Some countries banned multiple positions of this author",
      cx: 0,
      cy: 140,
      r: circleRadiusScale(25),
      fill: COLOUR_MULTIPLE_BOOKS_BANNED,
    },
    {
      legend: "Selected author",
      cx: 0,
      cy: 170,
      r: circleRadiusScale(25),
      fill: COLOUR_SELECTED_AUTHOR,
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

  // get X and Y coordinates of the text
  const getTextPosition = (i) => {
    // the first 4 circles are displayed next to each other
    if (i < 4) {
      return [Math.round((legendWidth * i) / 3), 85];
    }
    // the other circles are displayed one per row
    return [35, 115 + (i - 4) * 30];
  };

  circleGroups
    .append("text")
    .attr("class", "legend-label")
    .attr("text-anchor", (_, i) => (i < 4 ? "middle" : "left"))
    .attr("x", (_, i) => getTextPosition(i)[0])
    .attr("y", (_, i) => getTextPosition(i)[1])
    .text((d) => d.legend);
};
