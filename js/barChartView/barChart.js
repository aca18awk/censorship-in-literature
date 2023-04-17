import { COLOUR_BOOK_SELECTED, COLOUR_BOOK } from "../colourPallete.js";
import { drawCabinet } from "./cabinet.js";

export const createBarChart = (parent, props) => {
  // unpack my props
  let { data, width, height, onBookSelected, isBookSelected } = props;
  const columnHeight = 100;
  const columnPadding = 10;
  const bookWidth = 15;
  const bookPadding = 2;
  const shelvesNo = 5;
  const booksOnShelfNo = 20;

  const cabinetWidth = booksOnShelfNo * (bookWidth + bookPadding) - bookPadding;
  const cabinetHeight = (columnHeight + columnPadding) * shelvesNo;
  const margin = {
    top: 120,
    left: (width - cabinetWidth) / 2,
  };

  // calculates the Y position of the book
  // position 20 books on the shelf
  const getBookPositionY = (d, i) => {
    const bookshelf_no = parseInt(i / booksOnShelfNo);
    return (
      margin.top +
      yScale(d.count) +
      (columnHeight + columnPadding) * bookshelf_no
    );
  };

  // calculates the X position of the book
  // position 20 books on the shelf
  const getBookPositionX = (i) => {
    return margin.left + (bookWidth + bookPadding) * (i % booksOnShelfNo);
  };

  // calculates the height of the book
  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.count))
    .range([columnHeight / 2, 0]);

  // Chart taking care of inner margins
  const chart = parent.selectAll(".barChart").data([null]);
  const chartEnter = chart.enter().append("g").attr("class", "barChart");

  // zoom event
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

  // draw the bookshelf shape
  drawCabinet(
    chartEnter,
    margin,
    cabinetHeight,
    cabinetWidth,
    getBookPositionX
  );

  // Plot data
  const books = chartEnter
    .merge(chart)
    .selectAll(".book")
    .data(data, (d) => d.title);

  const booksEnter = books.enter().append("rect").attr("class", "book");

  chartEnter
    .append("pattern")
    .attr("id", "dot-pattern")
    .attr("patternUnits", "userSpaceOnUse")
    .attr("width", 4)
    .attr("height", 4)
    .append("rect")
    .attr("fill", COLOUR_BOOK_SELECTED)
    .attr("width", "100%")
    .attr("height", "100%");

  // Create dotted pattern for the selected book
  chartEnter
    .select("#dot-pattern")
    .append("circle")
    .attr("cx", 2.5)
    .attr("cy", 2.5)
    .attr("r", 0.5)
    .attr("fill", COLOUR_BOOK);

  booksEnter
    .merge(books)
    .attr("x", (_, i) => getBookPositionX(i))
    .attr("y", (d, i) => getBookPositionY(d, i))
    .attr("width", bookWidth)
    .attr("height", (d) => columnHeight - yScale(d.count))
    .attr("fill", (d) =>
      isBookSelected(d) ? "url(#dot-pattern)" : COLOUR_BOOK
    );

  books.exit().remove();

  // onClick event
  booksEnter.attr("cursor", "pointer").on("click", (_, d) => {
    onBookSelected(d);
  });

  // TOOLTIP EVENTS
  const tooltipPadding = 15;
  booksEnter
    .on("mouseover", (event, d) => {
      d3
        .select("#tooltip")
        .style("display", "block")
        .style("left", event.pageX + tooltipPadding + "px")
        .style("top", event.pageY + tooltipPadding + "px").html(`
        <div class="tooltip-title">"${d.title}"</div>
        <div>by <i> ${d.author}</i></div>
        <div>Was banned in ${d.banned_in.length} countries</div>
      `);
    })
    .on("mouseleave", () => {
      d3.select("#tooltip").style("display", "none");
    });
};
