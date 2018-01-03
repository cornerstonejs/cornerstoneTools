const elementToolOptions = {};

function getToolOptions (toolType, element) {
  if (!elementToolOptions[toolType]) {
    return {};
  }

  const toolOptions = elementToolOptions[toolType];
  const optionsObject = toolOptions.find((toolOptionObject) => toolOptionObject.element === element);

  if (!optionsObject) {
    return {};
  }

  return optionsObject.options;
}

function setToolOptions (toolType, element, options) {
  if (!elementToolOptions[toolType]) {
    elementToolOptions[toolType] = [{
      element,
      options
    }];

    return;
  }

  const toolOptions = elementToolOptions[toolType];
  const index = toolOptions.findIndex((toolOptionObject) => toolOptionObject.element === element);

  if (index === -1) {
    elementToolOptions[toolType].push({
      element,
      options
    });
  } else {
    elementToolOptions[toolType][index].options = options;
  }
}

export { getToolOptions, setToolOptions };
