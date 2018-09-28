import EVENTS from './../events.js';
import triggerEvent from './../util/triggerEvent.js';
import getToolForElement from './getToolForElement.js';
import { state } from './../store/index.js';

/**
 * Sets a tool's state to 'active'. Active tools are rendered,
 * respond to user input, and can create new data
 *
 * @export
 * @param {object} element
 * @param {string} toolName
 * @param {(object|number)} options
 * @param {boolean} isTouchActive
 * @returns
 */
const setToolActiveForElement = function (
  element,
  toolName,
  options,
  isTouchActive
) {
  // Find active tool w/ matching mouseButtonMask
  // Find active tool w/ active touch
  // Find active tool w/ active two finger?
  // Find active tool w/ ...?

  // Resume normal behavior
  setToolModeForElement(
    'active',
    null,
    element,
    toolName,
    options,
    isTouchActive
  );
};

/**
 *
 * @export
 * @param {string} toolName
 * @param {(object|number)} options
 * @param {boolean} isTouchActive
 * @returns
 */
const setToolActive = function (toolName, options, isTouchActive) {
  state.enabledElements.forEach((element) => {
    setToolActiveForElement(element, toolName, options, isTouchActive);
  });
};

/**
 * Sets a tool's state to 'disabled'. Disabled tools are not rendered,
 * and do not respond to user input
 *
 * @export
 * @param {object} element
 * @param {string} toolName
 * @param {(object|number)} options
 * @param {boolean} isTouchActive
 * @returns
 */
const setToolDisabledForElement = setToolModeForElement.bind(
  null,
  'disabled',
  null
);

/**
 *
 * @export
 * @param {string} toolName
 * @param {(object|number)} options
 * @param {boolean} isTouchActive
 * @returns
 */
const setToolDisabled = setToolMode.bind(null, 'disabled', null);

/**
 * Sets a tool's state to 'enabled'. Enabled tools are rendered,
 * but do not respond to user input
 *
 * @export
 * @param {object} element
 * @param {string} toolName
 * @param {(object|number)} options
 * @param {boolean} isTouchActive
 * @returns
 */
const setToolEnabledForElement = setToolModeForElement.bind(
  null,
  'enabled',
  null
);

/**
 *
 * @export
 * @param {string} toolName
 * @param {(object|number)} options
 * @param {boolean} isTouchActive
 * @returns
 */
const setToolEnabled = setToolMode.bind(null, 'enabled', null);

/**
 * Sets a tool's state to 'passive'. Passive tools are rendered and respond to user input,
 * but do not create new measurements or annotations.
 *
 * @export
 * @param {object} element
 * @param {string} toolName
 * @param {(object|number)} options
 * @param {boolean} isTouchActive
 * @returns
 */
const setToolPassiveForElement = setToolModeForElement.bind(
  null,
  'passive',
  EVENTS.TOOL_DEACTIVATED
);

/**
 *
 * @export
 * @param {string} toolName
 * @param {(object|number)} options
 * @param {boolean} isTouchActive
 * @returns
 */
const setToolPassive = setToolMode.bind(
  null,
  'passive',
  EVENTS.TOOL_DEACTIVATED
);

/**
 * An internal method that helps make sure we change tool state in a consistent
 * way
 *
 * @param {string} mode
 * @param {string} changeEvent
 * @param {object} element
 * @param {string} toolName
 * @param {(object|number)} options
 * @param {boolean} isTouchActive
 * @returns
 */
function setToolModeForElement (
  mode,
  changeEvent,
  element,
  toolName,
  options,
  isTouchActive
) {
  const tool = getToolForElement(element, toolName);

  if (!tool) {
    console.warn(`Unable to find tool '${toolName}' for enabledElement`);

    return;
  }

  // Set mode & options
  tool.mode = mode;
  if (typeof options === 'object') {
    tool.options = Object.assign({}, tool.options, options);
  } else if (typeof options === 'number') {
    options = {
      mouseButtonMaske: options,
      isTouchActive: isTouchActive === true
    };
  }

  // Call tool's hook for this event, if one exists
  if (tool[`${mode}Callback`]) {
    tool[`${mode}Callback`](element, options);
  }

  // Emit event indicating tool state change
  if (changeEvent) {
    const statusChangeEventData = {
      options,
      toolName,
      type: changeEvent
    };

    triggerEvent(element, changeEvent, statusChangeEventData);
  }

  // Trigger Update
  // Todo: don't error out if image hasn't been loaded...
  // Cornerstone.updateImage(element);
}

/**
 * A helper/quick way to set a tool's mode for all canvases
 *
 * @param {string} mode
 * @param {string} changeEvent
 * @param {string} toolName
 * @param {(object|number)} options
 * @param {boolean} isTouchActive
 */
function setToolMode (mode, changeEvent, toolName, options, isTouchActive) {
  state.enabledElements.forEach((element) => {
    setToolModeForElement(
      mode,
      changeEvent,
      element,
      toolName,
      options,
      isTouchActive
    );
  });
}

export {
  setToolActive,
  setToolActiveForElement,
  setToolDisabled,
  setToolDisabledForElement,
  setToolEnabled,
  setToolEnabledForElement,
  setToolPassive,
  setToolPassiveForElement
};
