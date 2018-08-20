import EVENTS from './../events.js';
import triggerEvent from './../util/triggerEvent.js';
import getToolForElement from './getToolForElement.js';
import { state } from './../store/index.js';

/**
 * Sets a tool's state to 'active'. Active tools are rendered,
 * respond to user input, and can create new data
 *
 * @export
 * @param {*} element
 * @param {*} toolName
 * @param {*} options
 * @returns
 */
const setToolActiveForElement = setToolModeForElement.bind(
  null,
  'active',
  null
);
const setToolActive = setToolMode.bind(null, 'active', null);

/**
 * Sets a tool's state to 'disabled'. Disabled tools are not rendered,
 * and do not respond to user input
 *
 * @export
 * @param {*} element
 * @param {*} toolName
 * @param {*} options
 * @returns
 */
const setToolDisabledForElement = setToolModeForElement.bind(
  null,
  'disabled',
  null
);
const setToolDisabled = setToolMode.bind(null, 'disabled', null);

/**
 * Sets a tool's state to 'enabled'. Enabled tools are rendered,
 * but do not respond to user input
 *
 * @export
 * @param {*} element
 * @param {*} toolName
 * @param {*} options
 * @returns
 */
const setToolEnabledForElement = setToolModeForElement.bind(
  null,
  'enabled',
  null
);
const setToolEnabled = setToolMode.bind(null, 'enabled', null);

/**
 * Sets a tool's state to 'passive'. Passive tools are rendered and respond to user input,
 * but do not create new measurements or annotations.
 *
 * @export
 * @param {*} element
 * @param {*} toolName
 * @param {*} options
 * @returns
 */
const setToolPassiveForElement = setToolModeForElement.bind(
  null,
  'passive',
  EVENTS.TOOL_DEACTIVATED
);
const setToolPassive = setToolMode.bind(
  null,
  'passive',
  EVENTS.TOOL_DEACTIVATED
);

/**
 * An internal method that helps make sure we change tool state in a consistent
 * way
 *
 * @param {*} element
 * @param {*} toolName
 * @param {*} options
 * @param {*} mode
 * @param {*} changeEvent
 * @returns
 */
function setToolModeForElement (mode, changeEvent, element, toolName, options) {
  const tool = getToolForElement(element, toolName);

  if (!tool) {
    console.error(`Unable to find tool '${toolName}' for enabledElement`);

    return;
  }

  // Set mode & options
  tool.mode = mode;
  if (options) {
    tool.options = options;
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
 * @param {*} mode
 * @param {*} changeEvent
 * @param {*} toolName
 * @param {*} options
 */
function setToolMode (mode, changeEvent, toolName, options) {
  state.enabledElements.forEach((element) => {
    setToolModeForElement(mode, changeEvent, element, toolName, options);
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
