export const addOptionButton = (location, selectedOptions) => {
  const button = document.createElement("button");
  const buttonText = document.createTextNode("❌ ");
  const buttonSpan = document.createElement("span");
  const buttonSpanText = document.createTextNode(location);
  button.setAttribute("class", "selected_location");
  button.setAttribute("data-value", location);
  button.appendChild(buttonText);
  buttonSpan.appendChild(buttonSpanText);
  button.appendChild(buttonSpan);
  selectedOptions.appendChild(button);
};

export const removeButton = (button, country) => {
  const optionSelect = document.querySelector(
    `#location_menu [value="${country}"]`
  );
  optionSelect.selected = false;
  button.remove();
};
