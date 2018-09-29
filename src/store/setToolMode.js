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
  const tool = getToolForElement(element, toolName);

  if (tool) {
    _resolveInputConflicts(element, tool, options, isTouchActive);
    // TODO: Find active tool w/ active two finger?
    // TODO: Find active tool w/ ...?
  }

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

  // MouseButtonMask (and isTouchActive) provided as values
  if (typeof options === 'number') {
    options = {
      mouseButtonMask: options
    };

    if (isTouchActive === true || isTouchActive === false) {
      options.isTouchActive = isTouchActive === true;
    }
  }
  // Options is an object, or null/undefined
  else {
    options = options || {};
  }

  // Set mode & options
  tool.mode = mode;
  tool.options = Object.assign({}, tool.options, options);

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

/**
 * Find tool's that conflict with the incoming tool's mouse/touch bindings and
 * resolve those conflicts.
 *
 * @param {*} element
 * @param {*} tool
 * @param {*} options
 * @param {*} isTouchActive
 * @private
 */
function _resolveInputConflicts (element, tool, options, isTouchActive) {
  // There are two API overloads for changing a tool's mode. This helps us
  // Determine where to find our mask values.
  const isValueApiOverload = typeof options === 'number';
  const mouseButtonMaskValue = isValueApiOverload
    ? options
    : options.mouseButtonMask;
  const isTouchActiveValue = isValueApiOverload
    ? isTouchActive
    : options.isTouchActive;

  _resolveMouseInputConflicts(tool, element, mouseButtonMaskValue);
  _resolveTouchInputConflicts(tool, element, isTouchActiveValue);
}

/**
 * Try to find an active tool that use the same mouse button mask as
 * the input tool. If found, set that tool to `passive` to prevent
 * conflicts.
 *
 * @param {*} element
 * @param {*} options
 * @param {*} isTouchActive
 * @private
 */
function _resolveMouseInputConflicts (tool, element, mouseButtonMask) {
  const hasMouseButtonMask =
    mouseButtonMask !== undefined && mouseButtonMask > 0;
  const activeToolWithMatchingMouseButtonMask = state.tools.find(
    (tool) =>
      tool.element === element &&
      tool.mode === 'active' &&
      tool.options.mouseButtonMask === mouseButtonMask
  );

  if (hasMouseButtonMask && activeToolWithMatchingMouseButtonMask) {
    console.info(
      `Setting tool ${activeToolWithMatchingMouseButtonMask.name} to passive`
    );
    setToolPassiveForElement(
      element,
      activeToolWithMatchingMouseButtonMask.name
    );
  }
}

/**
 * If the incoming tool isTouchActive, find any conflicting tools
 * and set their isTouchActive to false to avoid conflicts.
 *
 * @param {*} tool
 * @param {*} element
 * @param {*} options
 * @param {*} isTouchActive
 * @private
 */
function _resolveTouchInputConflicts (tool, element, isTouchActive) {
  if (isTouchActive === true) {
    const activeToolWithIsTouchActive = state.tools.find(
      (tool) =>
        tool.element === element &&
        tool.mode === 'active' &&
        tool.options.isTouchActive === true
    );

    if (activeToolWithIsTouchActive) {
      activeToolWithIsTouchActive.options.isTouchActive = false;
    }
  }
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
