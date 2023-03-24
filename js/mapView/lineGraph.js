export const drawLineGraph = (parent, props) => {
  // unpack my props
  const { data, margin, xValue, yValue, title } = props;
  let minYear, maxYear;
  let minCount, maxCount;

  data.forEach((country) => {
    const [firstYear, lastYear] = d3.extent(country.years, (d) => d.year);
    const [countMin, countMax] = d3.extent(country.years, (d) => d.count);
    minYear = minYear ? Math.min(firstYear, minYear) : firstYear;
    maxYear = maxYear ? Math.max(maxYear, lastYear) : lastYear;
    minCount = minCount ? Math.min(countMin, minCount) : countMin;
    maxCount = maxCount ? Math.max(maxCount, countMax) : countMax;
  });

  let lineData = [];
  data.forEach((country) => {
    let years = [];
    for (let i = minYear; i <= maxYear; i++) {
      const csvObject = country.years.find((e) => e.year === String(i));
      let a = {
        year: i,
        count: csvObject ? csvObject.count : 0,
      };
      years.push(a);
    }
    lineData.push({
      name: country.name,
      years: years,
    });
  });

  const width = +parent.attr("width");
  const height = +parent.attr("height");
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const chartArea = parent.selectAll(".chart").data([null]);
  const chart = chartArea
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
      .on("zoom", (event) => chart.attr("transform", event.transform))
  );

  // Initialise scales
  const xScale = d3
    .scaleTime()
    .domain([new Date(minYear, 0), new Date(maxYear, 0)])
    .range([0, innerWidth]);

  const yScale = d3
    .scaleLinear()
    .domain([0, maxCount])
    .range([innerHeight, 0])
    .nice();

  let color = d3
    .scaleOrdinal()
    .domain(lineData, (d) => d.name)
    .range([
      "#e41a1c",
      "#377eb8",
      "#4daf4a",
      "#984ea3",
      "#ff7f00",
      "#ffff33",
      "#a65628",
      "#f781bf",
      "#999999",
    ]);

  const yAxisTicks = yScale.ticks().filter((tick) => Number.isInteger(tick));

  // Initialise axes
  const xAxis = d3.axisBottom(xScale).tickPadding(10);

  const yAxis = d3
    .axisLeft(yScale)
    .tickPadding(10)
    .tickValues(yAxisTicks)
    .tickFormat(d3.format("d"));

  const xAxisG = chartArea.select(".x-axis");
  const xAxisGEnter = chart
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${innerHeight})`);
  xAxisG.merge(xAxisGEnter).call(xAxis).select(".domain").remove();

  // Append y-axis group
  const yAxisG = chartArea.select(".y-axis");
  const yAxisGEnter = chart.append("g").attr("class", "y-axis");
  yAxisG.merge(yAxisGEnter).call(yAxis).select(".domain").remove();

  // title
  const titleG = chartArea.select(".title");
  const titleEnter = chart.append("text").attr("class", "title");

  titleG
    .merge(titleEnter)
    .attr("y", -30)
    .text(title)
    .select(".domain")
    .remove();

  // Plot data
  const lineGenerator = d3
    .line()
    .x((d) => xScale(xValue(d)))
    .y((d) => yScale(yValue(d)));

  const line = chart.merge(chartArea).selectAll(".chart-line").data(lineData);

  // Update the line
  line
    .enter()
    .append("path")
    .attr("class", "chart-line")
    .attr("stroke", (d) => color(d.name))
    .merge(line)
    .transition()
    .duration(1000)
    .attr("d", (d) => lineGenerator(d.years));

  line.exit().remove();
};
