// Adopted from: https://github.com/jeffreymorganio/d3-country-bubble-chart
// https://www.d3indepth.com/force-layout/
// https://observablehq.com/d/bab58bcfeea93d76
// https://stackoverflow.com/questions/51153379/getting-d3-force-to-work-in-update-pattern
import { drawBookshelf } from "./bookshelfShape.js";

export const createBarChart = (parent, props) => {
  // unpack my props
  let { data, width, height, colourScale } = props;
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

  const positionY = (d, i) => {
    const bookshelf_no = parseInt(i / booksOnShelfNo);
    return (
      margin.top +
      yScale(d.count) +
      (columnHeight + columnPadding) * bookshelf_no
    );
  };

  const positionX = (i) => {
    return margin.left + (bookWidth + bookPadding) * (i % booksOnShelfNo);
  };

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.count))
    .range([columnHeight / 2, 0]);

  // Chart taking care of inner margins
  const chart = parent.selectAll(".bubbleChart").data([null]);
  const chartEnter = chart.enter().append("g").attr("class", "bubbleChart");

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
  drawBookshelf(chartEnter, margin, cabinetHeight, cabinetWidth, positionX);

  // Plot data
  const books = chartEnter
    .merge(chart)
    .selectAll(".book")
    .data(data, (d) => d.title);

  const booksEnter = books.enter().append("rect").attr("class", "book");

  booksEnter
    .merge(books)
    .attr("x", (d, i) => positionX(i))
    .attr("y", (d, i) => positionY(d, i))
    .attr("width", bookWidth)
    .attr("height", (d) => columnHeight - yScale(d.count))
    .attr("fill", "#e0c600");

  books.exit().remove();

  booksEnter
    .attr("cursor", (d) => "pointer")
    .on("click", (event, d) => {
      d3.select("#book_info").html(`
    <div class="book_title">${d.title} <div> by <i> ${d.author}</i> </div></div>
    <div class="book_location"><i>Was banned <b>${d.count}</b> times in ${
        d.banned_in.length
      } countries:</i>
    <ul>
    ${d.banned_in
      .map((country) => `<li>${country.location}: ${country.count} times</li>`)
      .join("")}
  </ul>
  </div>
  `);
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
        <div class="tooltip-title">${d.title}</div>
        <div>by <i> ${d.author}</i></div>
        <div>Was banned in ${d.banned_in.length} countries</div>
      `);
    })
    .on("mouseleave", () => {
      d3.select("#tooltip").style("display", "none");
    });
};
