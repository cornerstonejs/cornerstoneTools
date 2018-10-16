const elementToolOptions = {};

/**
 * Retrieve the options object associated with a particular toolType and element
 * @export @public @method
 * @name getToolOptions
 *
 * @param {string} toolType Tool type identifier of the target options object
 * @param {HTMLElement} element Element of the target options object
 *
 * @returns {object} Target options object (empty if not yet set)
 */
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

/**
 * Set the options object associated with a particular toolType and element.
 * @export @public @method
 * @name setToolOptions
 *
 * @param {string} toolType Tool type identifier of the target options object.
 * @param {HTMLElement} element Element of the target options object.
 * @param {Object} options Options object to store at target.
 */
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

/**
 * Clear the options object associated with a particular toolType and element.
 * @export @public @method
 * @name clearToolOptions
 *
 * @param {string} toolType Tool type identifier of the target options object.
 * @param {HTMLElement} element Element of the target options object.
 */
function clearToolOptions (toolType, element) {
  const toolOptions = elementToolOptions[toolType];

  if (toolOptions) {
    elementToolOptions[toolType] = toolOptions.filter(
      (toolOptionObject) => toolOptionObject.element !== element
    );
  }
}

/**
 * Clear the options objects associated with a particular toolType.
 * @export @public @method
 * @name clearToolOptionsByToolType
 *
 * @param {string} toolType Tool type identifier of the target options objects.
 */
function clearToolOptionsByToolType (toolType) {
  delete elementToolOptions[toolType];
}

/**
 * Clear the options objects associated with a particular element.
 * @export @public @method
 * @name clearToolOptionsByElement
 *
 * @param {HTMLElement} element Element of the target options objects.
 */
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
