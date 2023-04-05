// Adopted from: https://github.com/jeffreymorganio/d3-country-bubble-chart
// https://www.d3indepth.com/force-layout/
// https://observablehq.com/d/bab58bcfeea93d76
// https://stackoverflow.com/questions/51153379/getting-d3-force-to-work-in-update-pattern
import { drawBookshelf } from "./bookshelfShape.js";

export const createBarChart = (parent, props) => {
  // unpack my props
  let { data, width, height, colourScale } = props;
  const shelveHeight = 100;
  const bookWidth = 15;
  const noOfBooksOnShelf = 20;
  const bookPadding = 2;
  const margin = {
    top: 120,
    left: 500,
  };

  const shelfWidth = 21 * bookWidth + noOfBooksOnShelf + bookPadding;

  const shelfHight = 550;

  // Chart taking care of inner margins
  const chart = parent.selectAll(".bubbleChart").data([null]);
  const chartEnter = chart.enter().append("g").attr("class", "bubbleChart");

  // TODO: fix zooming in
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

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.count))
    .range([shelveHeight / 2, 0]);

  // Plot data
  const books = chartEnter
    .merge(chart)
    .selectAll(".book")
    .data(data, (d) => d.title);
  const booksEnter = books.enter().append("rect").attr("class", "book");

  const getColour = (d) => {
    return "#e0c600";
  };

  const positionBooks = (d, i) => {
    const bookshelf_no = parseInt(i / noOfBooksOnShelf);
    return margin.top + yScale(d.count) + (shelveHeight + 10) * bookshelf_no;
  };

  const positionBooksX = (i) => {
    return margin.left + (bookWidth + bookPadding) * (i % noOfBooksOnShelf);
  };

  // draw the bookshelf shape
  drawBookshelf(chartEnter, margin, shelfHight, shelfWidth, positionBooksX);

  const gradientStops = [
    { color: "#e0c600", offset: 20 },
    { color: "#e0c600", offset: 50 },
    { color: "#e0c600", offset: 80 },
  ];

  // Linear gradient to be used for the legend
  const linearGradient = chartEnter
    .append("linearGradient")
    .attr("id", "legend-gradientBook");

  // Update gradient for legend
  linearGradient
    .selectAll("stop")
    .data(gradientStops)
    .enter()
    .append("stop")
    .attr("offset", (d) => `${d.offset}%`)
    .attr("stop-color", (d) => d.color);

  booksEnter
    .merge(books)
    .attr("x", (d, i) => positionBooksX(i))
    .attr("y", (d, i) => positionBooks(d, i))
    .attr("width", bookWidth)
    .attr("height", (d) => shelveHeight - yScale(d.count))
    .attr("fill", "url(#legend-gradientBook)");
  // .attr("fill", "#e0c600");

  books.exit().remove();

  // TOOLTIP EVENTS
  // TODO: display where it was banned
  const tooltipPadding = 15;
  booksEnter
    .on("mouseover", (event, d) => {
      d3
        .select("#tooltip")
        .style("display", "block")
        .style("left", event.pageX + tooltipPadding + "px")
        .style("top", event.pageY + tooltipPadding + "px").html(`
        <div class="tooltip-title">${d.title}</div>
        <div><i> ${d.author}</i></div>
      `);
    })
    .on("mouseleave", () => {
      d3.select("#tooltip").style("display", "none");
    });
};
