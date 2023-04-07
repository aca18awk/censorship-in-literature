/*
Standard 'dropdown menu' html component
<select>
  <option value="volvo">Volvo</option>
  <option value="saab">Saab</option>
  <option value="mercedes">Mercedes</option>
  <option value="audi">Audi</option>
</select>
*/

export const dropdownMenu = (parent, props) => {
  const { options, onOptionSelected, selected } = props;

  console.log("options: ", options);

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
