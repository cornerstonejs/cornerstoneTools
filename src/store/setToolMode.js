import EVENTS from './../events.js';
import triggerEvent from './../util/triggerEvent.js';
import getToolForElement from './getToolForElement.js';
import {
  setToolCursor,
  resetToolCursor,
  hideToolCursor,
} from './setToolCursor.js';
import { getLogger } from '../util/logger.js';
import store, { getModule } from './index.js';

const globalConfiguration = getModule('globalConfiguration');
const logger = getLogger('store:setToolMode');

/**
 * Sets a tool's state, with the provided toolName and element, to 'active'. Active tools are rendered,
 * respond to user input, and can create new data.
 *
 * @public
 * @function setToolActiveForElement
 * @memberof CornerstoneTools
 *
 * @example <caption>Setting a tool 'active' for a specific interaction type.</caption>
 * // Sets length tool to Active
 * setToolActiveForElement(element, 'Length', {
 *   mouseButtonMask: 1
 * }, ['Mouse'])
 * @example <caption>Setting a tool 'active' for all interaction types.</caption>
 * // Sets length tool to Active
 * setToolActiveForElement(element, 'Length', {
 *   mouseButtonMask: 1
 * })
 * @param {HTMLElement} element
 * @param {string} toolName
 * @param {(Object|string[]|number)} options
 * @param {(string[])} interactionTypes
 * @returns {undefined}
 */
const setToolActiveForElement = function(
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

    // Iterate over specific interaction types and set active
    // This is used as a secondary check on active tools to find the active "parts" of the tool
    tool.supportedInteractionTypes.forEach(interactionType => {
      if (
        interactionTypes === undefined ||
        interactionTypes.includes(interactionType)
      ) {
        options[`is${interactionType}Active`] = true;
      } else {
        options[`is${interactionType}Active`] = false;
      }
    });

    if (
      globalConfiguration.configuration.showSVGCursors &&
      tool.supportedInteractionTypes.includes('Mouse')
    ) {
      _setToolCursorIfPrimary(element, options, tool);
    }
  }

  // Resume normal behavior
  setToolModeForElement('active', null, element, toolName, options);
};

function _setToolCursorIfPrimary(element, options, tool) {
  let mouseButtonMask;

  if (typeof options === 'number') {
    mouseButtonMask = [options];
  } else {
    mouseButtonMask = options.mouseButtonMask;
  }

  if (mouseButtonMask.includes(1)) {
    if (tool.svgCursor) {
      setToolCursor(tool.element, tool.svgCursor);
    } else if (tool.hideDefaultCursor) {
      hideToolCursor(element);
    } else {
      resetToolCursor(element);
    }
  }
}

/**
 * Sets all tool's state, with the provided toolName, to 'active'. Active tools are rendered,
 * respond to user input, and can create new data.
 * @public
 * @function setToolActive
 * @memberof CornerstoneTools
 *
 * @param {string} toolName
 * @param {(Object|string[]|number)} options
 * @param {(string[])} interactionTypes
 * @returns {undefined}
 */
const setToolActive = function(toolName, options, interactionTypes) {
  _trackGlobalToolModeChange('active', toolName, options, interactionTypes);
  store.state.enabledElements.forEach(element => {
    setToolActiveForElement(element, toolName, options, interactionTypes);
  });
};

/**
 * Sets a tool's state, with the provided toolName and element, to 'disabled'. Disabled tools are not rendered,
 * and do not respond to user input
 * @public
 * @function setToolDisabledForElement
 * @memberof CornerstoneTools
 *
 * @param {HTMLElement} element
 * @param {string} toolName
 * @param {(Object|number)} options
 * @returns {undefined}
 */
const setToolDisabledForElement = setToolModeForElement.bind(
  null,
  'disabled',
  null
);

/**
 * Sets all tool's state, with the provided toolName, to 'disabled'. Disabled tools are not rendered,
 * and do not respond to user input
 * @public
 * @function setToolDisabled
 * @memberof CornerstoneTools
 *
 * @param {string} toolName
 * @param {(Object|number)} options
 * @returns {undefined}
 */
const setToolDisabled = setToolMode.bind(null, 'disabled', null);

/**
 * Sets a tool's state, with the provided toolName and element, to 'enabled'. Enabled tools are rendered,
 * but do not respond to user input
 * @public
 * @function setToolEnabledForElement
 * @memberof CornerstoneTools
 *
 * @param {HTMLElement} element
 * @param {string} toolName
 * @param {(Object|number)} options
 * @returns {undefined}
 */
const setToolEnabledForElement = setToolModeForElement.bind(
  null,
  'enabled',
  null
);

/**
 * Sets all tool's state, with the provided toolName, to 'enabled'. Enabled tools are rendered,
 * but do not respond to user input
 * @public
 * @function setToolEnabled
 * @memberof CornerstoneTools
 *
 * @param {string} toolName
 * @param {(Object|number)} options
 * @returns {undefined}
 */
const setToolEnabled = setToolMode.bind(null, 'enabled', null);

/**
 * Sets a tool's state, with the provided toolName and element, to 'passive'. Passive tools are rendered and respond to user input,
 * but do not create new measurements or annotations.
 * @public
 * @function setToolPassiveForElement
 * @memberof CornerstoneTools
 *
 * @param {HTMLElement} element
 * @param {string} toolName
 * @param {(Object|number)} options
 * @returns {undefined}
 */
const setToolPassiveForElement = setToolModeForElement.bind(
  null,
  'passive',
  EVENTS.TOOL_DEACTIVATED
);

/**
 * Sets all tool's state, with the provided toolName, to 'passive'. Passive tools are rendered and respond to user input,
 * but do not create new measurements or annotations.
 * @public
 * @function setToolPassive
 * @memberof CornerstoneTools
 *
 * @param {string} toolName
 * @param {(Object|number)} options
 * @returns {undefined}
 */
const setToolPassive = setToolMode.bind(
  null,
  'passive',
  EVENTS.TOOL_DEACTIVATED
);

/**
 * An internal method that helps make sure we change tool mode in a consistent
 * way
 * @private
 * @function setToolModeForElement
 *
 * @param {string} mode
 * @param {string} changeEvent
 * @param {HTMLElement} element
 * @param {string} toolName
 * @param {(Object|number[]|number)} options
 * @returns {undefined}
 */
function setToolModeForElement(mode, changeEvent, element, toolName, options) {
  const tool = getToolForElement(element, toolName);

  if (!tool) {
    logger.warn('Unable to find tool "%s" for enabledElement', toolName);

    return;
  }

  options = _getNormalizedOptions(options);

  // Keep the same if not an array (undefined)
  // Reset if empty array
  // Merge if array contains any bindings
  if (
    Array.isArray(options.mouseButtonMask) &&
    options.mouseButtonMask.length !== 0 &&
    Array.isArray(tool.options.mouseButtonMask)
  ) {
    options.mouseButtonMask = _mergeMouseButtonMask(
      options.mouseButtonMask,
      tool.options.mouseButtonMask
    );
  }

  // Set mode & options
  tool.mode = mode;
  tool.mergeOptions(options);

  // Call tool's hook for this event, if one exists
  if (tool[`${mode}Callback`]) {
    tool[`${mode}Callback`](element, options);
  }

  // Emit event indicating tool state change
  if (changeEvent) {
    const statusChangeEventData = {
      options,
      toolName,
      toolType: toolName, // Deprecation notice: toolType will be replaced by toolName
      type: changeEvent,
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
 * @private
 * @function setToolMode
 *
 * @param {string} mode
 * @param {string} changeEvent
 * @param {string} toolName
 * @param {(Object|number)} options
 * @returns {undefined}
 */
function setToolMode(mode, changeEvent, toolName, options) {
  _trackGlobalToolModeChange(mode, toolName, options);
  store.state.enabledElements.forEach(element => {
    setToolModeForElement(mode, changeEvent, element, toolName, options);
  });
}

/**
 * Find tool's that conflict with the incoming tool's mouse/touch bindings and
 * resolve those conflicts.
 *
 * @private
 * @function _resolveInputConflicts
 *
 * @param {HTMLElement} element
 * @param {Object} tool
 * @param {(Object|number)} options
 * @param {(Array)} interactionTypes
 * @returns {undefined}
 */
function _resolveInputConflicts(element, tool, options, interactionTypes) {
  // Iterate over the interaction types our tool supports.
  // For each one we intend to activate, check for potential conflicts
  // And resolve them
  tool.supportedInteractionTypes.forEach(interactionType => {
    if (
      interactionTypes === undefined ||
      interactionTypes.includes(interactionType)
    ) {
      const inputResolver = _inputResolvers[interactionType];

      if (inputResolver) {
        inputResolver(tool, element, options);
      } else {
        logger.warn(
          'Unable to resolve input conflicts for type %s',
          interactionType
        );
      }
    }
  });

  const activeToolsForElement = store.state.tools.filter(
    t =>
      t.element === element &&
      t.mode === 'active' &&
      t.supportedInteractionTypes.length > 0
  );

  activeToolsForElement.forEach(t => {
    let toolHasAnyActiveInteractionType = false;

    t.supportedInteractionTypes.forEach(interactionType => {
      if (t.options[`is${interactionType}Active`]) {
        toolHasAnyActiveInteractionType = true;
      }
    });

    if (!toolHasAnyActiveInteractionType) {
      logger.log("Setting tool %s's to PASSIVE", t.name);
      setToolPassiveForElement(element, t.name);
    }
  });
}

/**
 * Resolves conflicting active tools when activating a tool for mouse interaction
 * @private
 * @function _resolveMouseInputConflicts
 *
 * @param {Object} tool
 * @param {HTMLElement} element
 * @param {(Object|number)} options
 * @returns {undefined}
 */
function _resolveMouseInputConflicts(tool, element, options) {
  const mouseButtonMask = _getNormalizedOptions(options).mouseButtonMask;
  const hasMouseButtonMask =
    Array.isArray(mouseButtonMask) && mouseButtonMask.length > 0;

  if (!hasMouseButtonMask) {
    return;
  }

  const activeToolWithMatchingMouseButtonMask = store.state.tools.find(
    t =>
      t.element === element &&
      t.mode === 'active' &&
      t.options.isMouseActive === true &&
      Array.isArray(t.options.mouseButtonMask) &&
      t.options.mouseButtonMask.some(v => mouseButtonMask.includes(v))
  );

  if (activeToolWithMatchingMouseButtonMask) {
    // Remove collissions
    activeToolWithMatchingMouseButtonMask.options.mouseButtonMask = activeToolWithMatchingMouseButtonMask.options.mouseButtonMask.filter(
      mask => !mouseButtonMask.includes(mask)
    );

    // If no remaining bindings, set inactive
    if (
      activeToolWithMatchingMouseButtonMask.options.mouseButtonMask.length === 0
    ) {
      activeToolWithMatchingMouseButtonMask.options.isMouseActive = false;
    }
  }
}

/**
 * Resolves conflicting active tools when activating a tool for touch interaction
 * @private
 * @function _resolveTouchInputConflicts
 *
 * @param {Object} tool
 * @param {HTMLElement} element
 * @returns {undefined}
 */
function _resolveTouchInputConflicts(tool, element) {
  const activeTouchTool = store.state.tools.find(
    t =>
      t.element === element &&
      t.mode === 'active' &&
      t.options.isTouchActive === true
  );

  const activeMultiTouchToolWithOneTouchPointer = store.state.tools.find(
    t =>
      t.element === element &&
      t.mode === 'active' &&
      t.options.isMultiTouchActive === true &&
      t.configuration.touchPointers === 1
  );

  if (activeTouchTool) {
    logger.log(
      "Setting tool %s's isTouchActive to false",
      activeTouchTool.name
    );
    activeTouchTool.options.isTouchActive = false;
  }
  if (activeMultiTouchToolWithOneTouchPointer) {
    logger.log(
      "Setting tool %s's isTouchActive to false",
      activeMultiTouchToolWithOneTouchPointer.name
    );
    activeMultiTouchToolWithOneTouchPointer.options.isMultiTouchActive = false;
  }
}

/**
 * Resolves conflicting active tools when activating a tool for MultiTouch interaction
 * @private
 * @function _resolveMultiTouchInputConflicts
 *
 * @param {Object} tool
 * @param {HTMLElement} element
 * @returns {undefined}
 */
function _resolveMultiTouchInputConflicts(tool, element) {
  const activeMultiTouchTool = store.state.tools.find(
    t =>
      t.element === element &&
      t.mode === 'active' &&
      t.options.isMultiTouchActive === true &&
      t.configuration.touchPointers === tool.configuration.touchPointers
  );

  let activeTouchTool;

  if (tool.configuration.touchPointers === 1) {
    activeTouchTool = store.state.tools.find(
      t =>
        t.element === element &&
        t.mode === 'active' &&
        t.options.isTouchActive === true
    );
  }

  if (activeMultiTouchTool) {
    logger.log(
      "Setting tool %s's isMultiTouchActive to false",
      activeMultiTouchTool.name
    );
    activeMultiTouchTool.options.isMultiTouchActive = false;
  }

  if (activeTouchTool) {
    logger.log(
      "Setting tool %s's isTouchActive to false",
      activeTouchTool.name
    );
    activeTouchTool.options.isTouchActive = false;
  }
}

/**
 * If the incoming tool isTouchActive, find any conflicting tools
 * and set their isTouchActive to false to avoid conflicts.
 *
 * @private
 * @function _resolveGenericInputConflicts
 *
 * @param {string} interactionType
 * @param {Object} tool
 * @param {HTMLElement} element
 * @param {(Object|number)} options
 * @returns {undefined}
 */
function _resolveGenericInputConflicts(interactionType, tool, element) {
  const interactionTypeFlag = `is${interactionType}Active`;
  const activeToolWithActiveInteractionType = store.state.tools.find(
    t =>
      t.element === element &&
      t.mode === 'active' &&
      t.options[interactionTypeFlag] === true
  );

  if (activeToolWithActiveInteractionType) {
    logger.log(
      "Setting tool %s's %s to false",
      activeToolWithActiveInteractionType.name,
      interactionTypeFlag
    );
    activeToolWithActiveInteractionType.options[interactionTypeFlag] = false;
  }
}

function _trackGlobalToolModeChange(mode, toolName, options, interactionTypes) {
  if (!globalConfiguration.configuration.globalToolSyncEnabled) {
    return;
  }

  // Update Tool History
  const historyEvent = {
    mode,
    args: [toolName, options],
  };

  if (interactionTypes) {
    historyEvent.push(interactionTypes);
  }

  store.state.globalToolChangeHistory.set(toolName, historyEvent);

  const arbitraryChangeHistoryLimit = 50;

  if (store.state.globalToolChangeHistory.size > arbitraryChangeHistoryLimit) {
    const changedToolIterator = store.state.globalToolChangeHistory.keys();
    const oldestTool = changedToolIterator.next().value;

    store.state.globalToolChangeHistory.delete(oldestTool);
  }

  // Update ActiveBindings Array
  const globalTool = store.state.globalTools[toolName];

  if (!globalTool) {
    logger.warn(
      `setToolMode call for tool not available globally: ${toolName}`
    );

    return;
  }

  if (mode === 'active') {
    let stringBindings = _determineStringBindings(
      toolName,
      options,
      interactionTypes
    );

    // Remove the incoming bindings from all global tools
    Object.keys(store.state.globalTools).forEach(key => {
      const tool = store.state.globalTools[key];

      tool.activeBindings = tool.activeBindings.filter(
        binding => !stringBindings.includes(binding)
      );
    });

    // @HACK: Clear mouse bindings
    if (stringBindings.some(binding => binding.includes('Mouse-DELETE'))) {
      globalTool.activeBindings = globalTool.activeBindings.filter(
        binding => !binding.includes('Mouse')
      );
      stringBindings = stringBindings.filter(
        binding => !binding.includes('Mouse')
      );
    }

    globalTool.activeBindings = globalTool.activeBindings.concat(
      stringBindings
    );
  } else {
    globalTool.activeBindings = [];
  }
}

function _determineStringBindings(toolName, options, interactionTypes) {
  if (interactionTypes === undefined && Array.isArray(options)) {
    interactionTypes = options;
    options = null;
  }

  const stringBindings = [];
  const globalTool = store.state.globalTools[toolName];

  if (globalTool) {
    // eslint-disable-next-line new-cap
    const tool = new globalTool.tool(globalTool.props);

    tool.supportedInteractionTypes.forEach(interactionType => {
      if (
        interactionTypes === undefined ||
        interactionTypes.includes(interactionType)
      ) {
        if (interactionType === 'Mouse') {
          const mouseButtonMasks = _getNormalizedOptions(options)
            .mouseButtonMask;

          // Add or delete
          if (Array.isArray(mouseButtonMasks) && mouseButtonMasks.length > 0) {
            mouseButtonMasks.forEach(mask =>
              stringBindings.push(`${interactionType}-${mask}`)
            );
          } else if (
            Array.isArray(mouseButtonMasks) &&
            mouseButtonMasks.length === 0
          ) {
            stringBindings.push(`${interactionType}-DELETE`);
          }
        } else if (interactionType === 'MultiTouch') {
          stringBindings.push(
            `${interactionType}-${tool.configuration.touchPointers}`
          );
        } else {
          stringBindings.push(interactionType);
        }
      }
    });
  }

  return stringBindings;
}

const _inputResolvers = {
  Mouse: _resolveMouseInputConflicts,
  MouseWheel: _resolveGenericInputConflicts.bind(this, 'MouseWheel'),
  Touch: _resolveTouchInputConflicts,
  TouchPinch: _resolveGenericInputConflicts.bind(this, 'TouchPinch'),
  TouchRotate: _resolveGenericInputConflicts.bind(this, 'TouchRotate'),
  DoubleTap: _resolveGenericInputConflicts.bind(this, 'DoubleTap'),
  MultiTouch: _resolveMultiTouchInputConflicts,
};

function _getNormalizedOptions(options) {
  if (Array.isArray(options)) {
    // If options is an array assume the array is the mouseButtonMask array
    options = { mouseButtonMask: options };
  } else if (options !== Object(options)) {
    // And if it's something other than an object, assume options is
    // a single mouseButtonMask
    options = { mouseButtonMask: [options] };
  }

  // If there is still no 'mouseButtonMask' default it to an empty array
  if (!options.hasOwnProperty('mouseButtonMask')) {
    options.mouseButtonMask = [];
  }

  if (!Array.isArray(options.mouseButtonMask)) {
    options.mouseButtonMask = [options.mouseButtonMask];
  }

  // Now filter out anything that is not an number or is the number 0
  options.mouseButtonMask = options.mouseButtonMask.filter(
    o => typeof o === 'number' && o !== 0
  );

  return options;
}

function _mergeMouseButtonMask(newMask, oldMask) {
  // Merges and removes duplicates
  return newMask.concat(oldMask).reduce((acc, m) => {
    if (acc.indexOf(m) === -1) {
      acc.push(m);
    }

    return acc;
  }, []);
}

export {
  setToolActive,
  setToolActiveForElement,
  setToolDisabled,
  setToolDisabledForElement,
  setToolEnabled,
  setToolEnabledForElement,
  setToolPassive,
  setToolPassiveForElement,
  // Exported for testing
  setToolMode,
  setToolModeForElement,
  _getNormalizedOptions,
  _mergeMouseButtonMask,
  _trackGlobalToolModeChange,
};
