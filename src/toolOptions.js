const elementToolOptions = {};

/**
 * Retrieve the options object associated with a particular toolName and element
 * @export
 * @public
 * @method
 * @name getToolOptions
 *
 * @param {string} toolName Tool name identifier of the target options object
 * @param {HTMLElement} element Element of the target options object
 *
 * @returns {Object} Target options object (empty if not yet set)
 */
function getToolOptions(toolName, element) {
  if (!elementToolOptions[toolName]) {
    return {};
  }

  const toolOptions = elementToolOptions[toolName];
  const optionsObject = toolOptions.find(
    toolOptionObject => toolOptionObject.element === element
  );

  if (!optionsObject) {
    return {};
  }

  return optionsObject.options;
}

/**
 * Set the options object associated with a particular toolName and element.
 * @export
 * @public
 * @method
 * @name setToolOptions
 *
 * @param {string} toolName Tool name identifier of the target options object.
 * @param {HTMLElement} element Element of the target options object.
 * @param {Object} options Options object to store at target.
 * @returns {void}
 */
function setToolOptions(toolName, element, options) {
  if (!elementToolOptions[toolName]) {
    elementToolOptions[toolName] = [
      {
        element,
        options,
      },
    ];

    return;
  }

  const toolOptions = elementToolOptions[toolName];
  const index = toolOptions.findIndex(
    toolOptionObject => toolOptionObject.element === element
  );

  if (index === -1) {
    elementToolOptions[toolName].push({
      element,
      options,
    });
  } else {
    const elementOptions = elementToolOptions[toolName][index].options || {};

    elementToolOptions[toolName][index].options = Object.assign(
      elementOptions,
      options
    );
  }
}

/**
 * Clear the options object associated with a particular toolName and element.
 * @export
 * @public
 * @method
 * @name clearToolOptions
 *
 * @param {string} toolName Tool name identifier of the target options object.
 * @param {HTMLElement} element Element of the target options object.
 * @returns {void}
 */
function clearToolOptions(toolName, element) {
  const toolOptions = elementToolOptions[toolName];

  if (toolOptions) {
    elementToolOptions[toolName] = toolOptions.filter(
      toolOptionObject => toolOptionObject.element !== element
    );
  }
}

/**
 * Clear the options objects associated with a particular toolType.
 *
 * Deprecation notice: use clearToolOptionsByToolName instead
 * @deprecated
 *
 * @export
 * @public
 * @method
 * @name clearToolOptionsByToolType
 *
 * @param {string} toolType Tool type identifier of the target options objects.
 * @returns {void}
 */
function clearToolOptionsByToolType(toolType) {
  return clearToolOptionsByToolName(toolType);
}

/**
 * Clear the options objects associated with a particular toolName.
 * @export
 * @public
 * @method
 * @name clearToolOptionsByToolName
 *
 * @param {string} toolName Tool name identifier of the target options objects.
 * @returns {void}
 */
function clearToolOptionsByToolName(toolName) {
  delete elementToolOptions[toolName];
}

/**
 * Clear the options objects associated with a particular element.
 * @export
 * @public
 * @method
 * @name clearToolOptionsByElement
 *
 * @param {HTMLElement} element Element of the target options objects.
 * @returns {void}
 */
function clearToolOptionsByElement(element) {
  for (const toolName in elementToolOptions) {
    elementToolOptions[toolName] = elementToolOptions[toolName].filter(
      toolOptionObject => toolOptionObject.element !== element
    );
  }
}

export {
  getToolOptions,
  setToolOptions,
  clearToolOptions,
  clearToolOptionsByToolType,
  clearToolOptionsByToolName,
  clearToolOptionsByElement,
};
