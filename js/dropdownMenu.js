export const dropdownMenu = (parent, props) => {
  const { options, onOptionSelected, selected } = props;

  const select = parent.selectAll("select").data([null]);
  const selectEnter = select
    .enter()
    .append("select")
    .merge(select)
    .on("change", onOptionSelected);

  const option = selectEnter.selectAll("option").data(options);
  option
    .enter()
    .append("option")
    .merge(option)
    .attr("value", (d) => d.value)
    .property("selected", (d) => d.value === selected)
    .text((d) => d.name);

  option.exit().remove();
};
