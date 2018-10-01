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
 * @param {(Object|Array|number)} options
 * @param {(Array)} interactionTypes
 * @returns
 */
const setToolActiveForElement = function (
  element,
  toolName,
  options,
  interactionTypes
) {
  // If interactionTypes was passed in via options
  if (interactionTypes === undefined && Array.isArray(options)) {
    interactionTypes = options;
    options = null;
  }

  const tool = getToolForElement(element, toolName);

  if (tool) {
    _resolveInputConflicts(element, tool, options, interactionTypes);
  }

  // Iterate over specific interaction types and set active
  // This is used as a secondary check on active tools to find the active "parts" of the tool
  tool.interactionTypes.forEach((interactionType) => {
    if (
      interactionTypes === undefined ||
      interactionTypes.includes(interactionType)
    ) {
      options[`is${interactionType}Active`] = true;
    } else {
      options[`is${interactionType}Active`] = false;
    }
  });

  // Resume normal behavior
  setToolModeForElement('active', null, element, toolName, options);
};

/**
 *
 * @export
 * @param {string} toolName
 * @param {(Object|Array|number)} options
 * @param {(Array)} interactionTypes
 * @returns
 */
const setToolActive = function (toolName, options, interactionTypes) {
  state.enabledElements.forEach((element) => {
    setToolActiveForElement(element, toolName, options, interactionTypes);
  });
};

/**
 * Sets a tool's state to 'disabled'. Disabled tools are not rendered,
 * and do not respond to user input
 *
 * @export
 * @param {object} element
 * @param {string} toolName
 * @param {(Object|number)} options
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
 * @param {(Object|number)} options
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
 * @param {(Object|number)} options
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
 * @param {(Object|number)} options
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
 * @param {(Object|number)} options
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
 * @param {(Object|number)} options
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
 * @param {(Object|number)} options
 * @returns
 */
function setToolModeForElement (mode, changeEvent, element, toolName, options) {
  const tool = getToolForElement(element, toolName);

  if (!tool) {
    console.warn(`Unable to find tool '${toolName}' for enabledElement`);

    return;
  }

  // MouseButtonMask
  if (typeof options === 'number') {
    options = {
      mouseButtonMask: options
    };
  } else {
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
 */
function setToolMode (mode, changeEvent, toolName, options) {
  state.enabledElements.forEach((element) => {
    setToolModeForElement(mode, changeEvent, element, toolName, options);
  });
}

/**
 * Find tool's that conflict with the incoming tool's mouse/touch bindings and
 * resolve those conflicts.
 *
 * @param {*} element
 * @param {*} tool
 * @param {(Object|number)} options
 * @param {(Array)} interactionTypes
 * @private
 */
function _resolveInputConflicts (element, tool, options, interactionTypes) {
  // Iterate over the interaction types our tool supports.
  // For each one we intend to activate, check for potential conflicts
  // And resolve them
  tool.supportedInteractionTypes.forEach((interactionType) => {
    if (
      interactionTypes === undefined ||
      interactionTypes.includes(interactionType)
    ) {
      const inputResolver =
        _inputResolvers[`_resolve${interactionType}InputConflicts`];

      if (inputResolver) {
        inputResolver(tool, element, options);
      } else {
        console.warn(
          `Unable to resolve input conflicts for type ${interactionType}`
        );
      }
    }
  });
}

const _inputResolvers = {
  _resolveMouseInputConflicts, // Mouse
  _resolveTouchInputConflicts // Touch
  // MouseWheel?
  // MultiTouch (may eventuall merge with touch)
  // TouchDrag
  // TouchPinch
  // DoubleTap
  // Display (can have multiple active...)
};

/**
 * Try to find an active tool that use the same mouse button mask as
 * the input tool. If found, set that tool to `passive` to prevent
 * conflicts.
 *
 * @param {*} tool
 * @param {*} element
 * @param {*} mouseButtonMask
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
