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
    const elementOptions = elementToolOptions[toolType][index].options || {};

    elementToolOptions[toolType][index].options = Object.assign(elementOptions, options);
  }
}

function clearToolOptions (toolType, element) {
  const toolOptions = elementToolOptions[toolType];

  if (toolOptions) {
    elementToolOptions[toolType] = toolOptions.filter(
      (toolOptionObject) => toolOptionObject.element !== element
    );
  }
}

function clearToolOptionsByToolType (toolType) {
  delete elementToolOptions[toolType];
}

function clearToolOptionsByElement (element) {
  for (const toolType in elementToolOptions) {
    elementToolOptions[toolType] = elementToolOptions[toolType].filter(
      (toolOptionObject) => toolOptionObject.element !== element
    );
  }
}

export {
  getToolOptions,
  setToolOptions,
  clearToolOptions,
  clearToolOptionsByToolType,
  clearToolOptionsByElement
};
