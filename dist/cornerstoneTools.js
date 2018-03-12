/*! cornerstone-tools - 2.1.0 - 2018-03-12 | (c) 2017 Chris Hafey | https://github.com/cornerstonejs/cornerstoneTools */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("cornerstoneTools", [], factory);
	else if(typeof exports === 'object')
		exports["cornerstoneTools"] = factory();
	else
		root["cornerstoneTools"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 52);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var cornerstone = window.cornerstone;
var cornerstoneMath = window.cornerstoneMath;
var Hammer = window.Hammer;

exports.default = {
  set cornerstone(cs) {
    cornerstone = cs;
  },
  get cornerstone() {
    return cornerstone;
  },
  set cornerstoneMath(cm) {
    cornerstoneMath = cm;
  },
  get cornerstoneMath() {
    return cornerstoneMath;
  },
  set Hammer(module) {
    Hammer = module;
  },
  get Hammer() {
    return Hammer;
  }
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var EVENTS = {
  // Events from Cornerstone Core
  IMAGE_RENDERED: 'cornerstoneimagerendered',
  NEW_IMAGE: 'cornerstonenewimage',
  IMAGE_CACHE_PROMISE_REMOVED: 'cornerstoneimagecachepromiseremoved',
  ELEMENT_DISABLED: 'cornerstoneelementdisabled',

  // Mouse events
  MOUSE_DOWN: 'cornerstonetoolsmousedown',
  MOUSE_UP: 'cornerstonetoolsmouseup',
  MOUSE_DOWN_ACTIVATE: 'cornerstonetoolsmousedownactivate',
  MOUSE_DRAG: 'cornerstonetoolsmousedrag',
  MOUSE_MOVE: 'cornerstonetoolsmousemove',
  MOUSE_CLICK: 'cornerstonetoolsmouseclick',
  MOUSE_DOUBLE_CLICK: 'cornerstonetoolsmousedoubleclick',
  MOUSE_WHEEL: 'cornerstonetoolsmousewheel',

  // Touch events
  TOUCH_START: 'cornerstonetoolstouchstart',
  TOUCH_START_ACTIVE: 'cornerstonetoolstouchstartactive',
  TOUCH_END: 'cornerstonetoolstouchend',
  TOUCH_DRAG: 'cornerstonetoolstouchdrag',
  TOUCH_DRAG_END: 'cornerstonetoolstouchdragend',
  TOUCH_PINCH: 'cornerstonetoolstouchpinch',
  TOUCH_ROTATE: 'cornerstonetoolstouchrotate',
  TOUCH_PRESS: 'cornerstonetoolstouchpress',
  TAP: 'cornerstonetoolstap',
  DOUBLE_TAP: 'cornerstonetoolsdoubletap',
  MULTI_TOUCH_START: 'cornerstonetoolsmultitouchstart',
  MULTI_TOUCH_START_ACTIVE: 'cornerstonetoolsmultitouchstartactive',
  MULTI_TOUCH_DRAG: 'cornerstonetoolsmultitouchdrag',

  // Keyboard events
  KEY_DOWN: 'cornerstonetoolskeydown',
  KEY_UP: 'cornerstonetoolskeyup',
  KEY_PRESS: 'cornerstonetoolskeypress',

  // Measurement / tool events
  MEASUREMENT_ADDED: 'cornerstonetoolsmeasurementadded',
  MEASUREMENT_MODIFIED: 'cornerstonetoolsmeasurementmodified',
  MEASUREMENT_REMOVED: 'cornerstonemeasurementremoved',
  TOOL_DEACTIVATED: 'cornerstonetoolstooldeactivated',
  CLIP_STOPPED: 'cornerstonetoolsclipstopped',
  STACK_SCROLL: 'cornerstonestackscroll', // Should be renamed

  LINE_SAMPLE_UPDATED: 'cornerstonelinesampleupdated'
};

exports.default = EVENTS;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getElementToolStateManager = exports.setElementToolStateManager = exports.clearToolState = exports.removeToolState = exports.getToolState = exports.addToolState = undefined;

var _events = __webpack_require__(1);

var _events2 = _interopRequireDefault(_events);

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _imageIdSpecificStateManager = __webpack_require__(15);

var _triggerEvent = __webpack_require__(3);

var _triggerEvent2 = _interopRequireDefault(_triggerEvent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getElementToolStateManager(element) {
  var enabledImage = _externalModules2.default.cornerstone.getEnabledElement(element);
  // If the enabledImage has no toolStateManager, create a default one for it
  // NOTE: This makes state management element specific

  if (enabledImage.toolStateManager === undefined) {
    enabledImage.toolStateManager = _imageIdSpecificStateManager.globalImageIdSpecificToolStateManager;
  }

  return enabledImage.toolStateManager;
}

// Here we add tool state, this is done by tools as well
// As modules that restore saved state
function addToolState(element, toolType, measurementData) {
  var toolStateManager = getElementToolStateManager(element);

  toolStateManager.add(element, toolType, measurementData);

  var eventType = _events2.default.MEASUREMENT_ADDED;
  var eventData = {
    toolType: toolType,
    element: element,
    measurementData: measurementData
  };

  (0, _triggerEvent2.default)(element, eventType, eventData);
}

// Here you can get state - used by tools as well as modules
// That save state persistently
function getToolState(element, toolType) {
  var toolStateManager = getElementToolStateManager(element);

  return toolStateManager.get(element, toolType);
}

function removeToolState(element, toolType, data) {
  var toolStateManager = getElementToolStateManager(element);
  var toolData = toolStateManager.get(element, toolType);
  // Find this tool data
  var indexOfData = -1;

  for (var i = 0; i < toolData.data.length; i++) {
    if (toolData.data[i] === data) {
      indexOfData = i;
    }
  }

  if (indexOfData !== -1) {
    toolData.data.splice(indexOfData, 1);

    var eventType = _events2.default.MEASUREMENT_REMOVED;
    var eventData = {
      toolType: toolType,
      element: element,
      measurementData: data
    };

    (0, _triggerEvent2.default)(element, eventType, eventData);
  }
}

function clearToolState(element, toolType) {
  var toolStateManager = getElementToolStateManager(element);
  var toolData = toolStateManager.get(element, toolType);

  // If any toolData actually exists, clear it
  if (toolData !== undefined) {
    toolData.data = [];
  }
}

// Sets the tool state manager for an element
function setElementToolStateManager(element, toolStateManager) {
  var enabledImage = _externalModules2.default.cornerstone.getEnabledElement(element);

  enabledImage.toolStateManager = toolStateManager;
}

exports.addToolState = addToolState;
exports.getToolState = getToolState;
exports.removeToolState = removeToolState;
exports.clearToolState = clearToolState;
exports.setElementToolStateManager = setElementToolStateManager;
exports.getElementToolStateManager = getElementToolStateManager;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = triggerEvent;
/**
 * Trigger a CustomEvent
 *
 * @param {EventTarget} el The element or EventTarget to trigger the event upon
 * @param {String} type The event type name
 * @param {Object|null} detail=null The event data to be sent
 * @returns {Boolean} The return value is false if at least one event listener called preventDefault(). Otherwise it returns true.
 */
function triggerEvent(el, type) {
  var detail = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  var event = void 0;

  // This check is needed to polyfill CustomEvent on IE11-
  if (typeof window.CustomEvent === 'function') {
    event = new CustomEvent(type, {
      detail: detail,
      cancelable: true
    });
  } else {
    event = document.createEvent('CustomEvent');
    event.initCustomEvent(type, true, true, detail);
  }

  return el.dispatchEvent(event);
}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var elementToolOptions = {};

/**
 * Retrieve the options object associated with a particular toolType and element
 *
 * @param {string} toolType Tool type identifier of the target options object
 * @param {HTMLElement} element Element of the target options object
 *
 * @return {Object} Target options object (empty if not yet set)
 */
function getToolOptions(toolType, element) {
  if (!elementToolOptions[toolType]) {
    return {};
  }

  var toolOptions = elementToolOptions[toolType];
  var optionsObject = toolOptions.find(function (toolOptionObject) {
    return toolOptionObject.element === element;
  });

  if (!optionsObject) {
    return {};
  }

  return optionsObject.options;
}

/**
 * Set the options object associated with a particular toolType and element
 *
 * @param {string} toolType Tool type identifier of the target options object
 * @param {HTMLElement} element Element of the target options object
 * @param {Object} options Options object to store at target
 *
 * @return {void}
 */
function setToolOptions(toolType, element, options) {
  if (!elementToolOptions[toolType]) {
    elementToolOptions[toolType] = [{
      element: element,
      options: options
    }];

    return;
  }

  var toolOptions = elementToolOptions[toolType];
  var index = toolOptions.findIndex(function (toolOptionObject) {
    return toolOptionObject.element === element;
  });

  if (index === -1) {
    elementToolOptions[toolType].push({
      element: element,
      options: options
    });
  } else {
    var elementOptions = elementToolOptions[toolType][index].options || {};

    elementToolOptions[toolType][index].options = Object.assign(elementOptions, options);
  }
}

/**
 * Clear the options object associated with a particular toolType and element
 *
 * @param {string} toolType Tool type identifier of the target options object
 * @param {HTMLElement} element Element of the target options object
 *
 * @return {void}
 */
function clearToolOptions(toolType, element) {
  var toolOptions = elementToolOptions[toolType];

  if (toolOptions) {
    elementToolOptions[toolType] = toolOptions.filter(function (toolOptionObject) {
      return toolOptionObject.element !== element;
    });
  }
}

/**
 * Clear the options objects associated with a particular toolType
 *
 * @param {string} toolType Tool type identifier of the target options objects
 *
 * @return {void}
 */
function clearToolOptionsByToolType(toolType) {
  delete elementToolOptions[toolType];
}

/**
 * Clear the options objects associated with a particular element
 *
 * @param {HTMLElement} element Element of the target options objects
 *
 * @return {void}
 */
function clearToolOptionsByElement(element) {
  for (var toolType in elementToolOptions) {
    elementToolOptions[toolType] = elementToolOptions[toolType].filter(function (toolOptionObject) {
      return toolOptionObject.element !== element;
    });
  }
}

exports.getToolOptions = getToolOptions;
exports.setToolOptions = setToolOptions;
exports.clearToolOptions = clearToolOptions;
exports.clearToolOptionsByToolType = clearToolOptionsByToolType;
exports.clearToolOptionsByElement = clearToolOptionsByElement;

/***/ }),
/* 5 */,
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (which, mouseButtonMask) {
  var mouseButton = 1 << which - 1;

  return (mouseButtonMask & mouseButton) !== 0;
};

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var defaultColor = 'white',
    activeColor = 'greenyellow',
    fillColor = 'transparent';

function setFillColor(color) {
  fillColor = color;
}

function getFillColor() {
  return fillColor;
}

function setToolColor(color) {
  defaultColor = color;
}

function getToolColor() {
  return defaultColor;
}

function setActiveColor(color) {
  activeColor = color;
}

function getActiveColor() {
  return activeColor;
}

function getColorIfActive(active) {
  return active ? activeColor : defaultColor;
}

var toolColors = {
  setFillColor: setFillColor,
  getFillColor: getFillColor,
  setToolColor: setToolColor,
  getToolColor: getToolColor,
  setActiveColor: setActiveColor,
  getActiveColor: getActiveColor,
  getColorIfActive: getColorIfActive
};

exports.default = toolColors;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var defaultWidth = 1,
    activeWidth = 2;

function setToolWidth(width) {
  defaultWidth = width;
}

function getToolWidth() {
  return defaultWidth;
}

function setActiveWidth(width) {
  activeWidth = width;
}

function getActiveWidth() {
  return activeWidth;
}

var toolStyle = {
  setToolWidth: setToolWidth,
  getToolWidth: getToolWidth,
  setActiveWidth: setActiveWidth,
  getActiveWidth: getActiveWidth
};

exports.default = toolStyle;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (context, textLines, x, y, color, options) {
  if (Object.prototype.toString.call(textLines) !== '[object Array]') {
    textLines = [textLines];
  }

  var padding = 5;
  var font = _textStyle2.default.getFont();
  var fontSize = _textStyle2.default.getFontSize();
  var backgroundColor = _textStyle2.default.getBackgroundColor();

  context.save();
  context.font = font;
  context.textBaseline = 'top';
  context.strokeStyle = color;

  // Find the longest text width in the array of text data
  var maxWidth = 0;

  textLines.forEach(function (text) {
    // Get the text width in the current font
    var width = context.measureText(text).width;

    // Find the maximum with for all the text rows;
    maxWidth = Math.max(maxWidth, width);
  });

  // Draw the background box with padding
  context.fillStyle = backgroundColor;

  // Calculate the bounding box for this text box
  var boundingBox = {
    width: maxWidth + padding * 2,
    height: padding + textLines.length * (fontSize + padding)
  };

  if (options && options.centering && options.centering.x === true) {
    x -= boundingBox.width / 2;
  }

  if (options && options.centering && options.centering.y === true) {
    y -= boundingBox.height / 2;
  }

  boundingBox.left = x;
  boundingBox.top = y;

  if (options && options.debug === true) {
    context.fillStyle = '#FF0000';
  }

  context.fillRect(boundingBox.left, boundingBox.top, boundingBox.width, boundingBox.height);

  // Draw each of the text lines on top of the background box
  textLines.forEach(function (text, index) {
    context.fillStyle = color;

    /* Var ypos;
        if (index === 0) {
            ypos = y + index * (fontSize + padding);
        } else {
            ypos = y + index * (fontSize + padding * 2);
        }*/

    context.fillText(text, x + padding, y + padding + index * (fontSize + padding));
  });

  context.restore();

  // Return the bounding box so it can be used for pointNearHandle
  return boundingBox;
};

var _textStyle = __webpack_require__(13);

var _textStyle2 = _interopRequireDefault(_textStyle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (context, renderData, handles, color, options) {
  context.strokeStyle = color;

  Object.keys(handles).forEach(function (name) {
    var handle = handles[name];

    if (handle.drawnIndependently === true) {
      return;
    }

    if (options && options.drawHandlesIfActive === true && !handle.active) {
      return;
    }

    context.beginPath();

    if (handle.active) {
      context.lineWidth = _toolStyle2.default.getActiveWidth();
    } else {
      context.lineWidth = _toolStyle2.default.getToolWidth();
    }

    var handleCanvasCoords = _externalModules2.default.cornerstone.pixelToCanvas(renderData.element, handle);

    context.arc(handleCanvasCoords.x, handleCanvasCoords.y, handleRadius, 0, 2 * Math.PI);

    if (options && options.fill) {
      context.fillStyle = options.fill;
      context.fill();
    }

    context.stroke();
  });
};

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _toolStyle = __webpack_require__(8);

var _toolStyle2 = _interopRequireDefault(_toolStyle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var handleRadius = 6;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var defaultStartLoadHandler = void 0;
var defaultEndLoadHandler = void 0;
var defaultErrorLoadingHandler = void 0;

function setStartLoadHandler(handler) {
  defaultStartLoadHandler = handler;
}

function getStartLoadHandler() {
  return defaultStartLoadHandler;
}

function setEndLoadHandler(handler) {
  defaultEndLoadHandler = handler;
}

function getEndLoadHandler() {
  return defaultEndLoadHandler;
}

function setErrorLoadingHandler(handler) {
  defaultErrorLoadingHandler = handler;
}

function getErrorLoadingHandler() {
  return defaultErrorLoadingHandler;
}

var loadHandlerManager = {
  setStartLoadHandler: setStartLoadHandler,
  getStartLoadHandler: getStartLoadHandler,
  setEndLoadHandler: setEndLoadHandler,
  getEndLoadHandler: getEndLoadHandler,
  setErrorLoadingHandler: setErrorLoadingHandler,
  getErrorLoadingHandler: getErrorLoadingHandler
};

exports.default = loadHandlerManager;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (renderData, handles) {
  var image = renderData.image;
  var imageRect = {
    left: 0,
    top: 0,
    width: image.width,
    height: image.height
  };

  var handleOutsideImage = false;

  Object.keys(handles).forEach(function (name) {
    var handle = handles[name];

    if (handle.allowedOutsideImage === true) {
      return;
    }

    if (_externalModules2.default.cornerstoneMath.point.insideRect(handle, imageRect) === false) {
      handleOutsideImage = true;
    }
  });

  return handleOutsideImage;
};

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var defaultFontSize = 15,
    defaultFont = defaultFontSize + 'px Arial',
    defaultBackgroundColor = 'transparent';

function setFont(font) {
  defaultFont = font;
}

function getFont() {
  return defaultFont;
}

function setFontSize(fontSize) {
  defaultFontSize = fontSize;
}

function getFontSize() {
  return defaultFontSize;
}

function setBackgroundColor(backgroundColor) {
  defaultBackgroundColor = backgroundColor;
}

function getBackgroundColor() {
  return defaultBackgroundColor;
}

var textStyle = {
  setFont: setFont,
  getFont: getFont,
  setFontSize: setFontSize,
  getFontSize: getFontSize,
  setBackgroundColor: setBackgroundColor,
  getBackgroundColor: getBackgroundColor
};

exports.default = textStyle;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = convertToVector3;

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Convert an Array to a cornerstoneMath.Vector3
 *
 * @param {Array|cornerstoneMath.Vector3} arrayOrVector3 Input array or Vector3
 * @return {cornerstoneMath.Vector3}
 */
function convertToVector3(arrayOrVector3) {
  var cornerstoneMath = _externalModules2.default.cornerstoneMath;

  if (arrayOrVector3 instanceof cornerstoneMath.Vector3) {
    return arrayOrVector3;
  }

  return new cornerstoneMath.Vector3(arrayOrVector3[0], arrayOrVector3[1], arrayOrVector3[2]);
}

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.globalImageIdSpecificToolStateManager = exports.newImageIdSpecificToolStateManager = undefined;

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// This implements an imageId specific tool state management strategy.  This means that
// Measurements data is tied to a specific imageId and only visible for enabled elements
// That are displaying that imageId.

function newImageIdSpecificToolStateManager() {
  var toolState = {};

  // Here we add tool state, this is done by tools as well
  // As modules that restore saved state

  function saveImageIdToolState(imageId) {
    return toolState[imageId];
  }

  function restoreImageIdToolState(imageId, imageIdToolState) {
    toolState[imageId] = imageIdToolState;
  }

  function saveToolState() {
    return toolState;
  }

  function restoreToolState(savedToolState) {
    toolState = savedToolState;
  }

  // Here we add tool state, this is done by tools as well
  // As modules that restore saved state
  function addImageIdSpecificToolState(element, toolType, data) {
    var enabledImage = _externalModules2.default.cornerstone.getEnabledElement(element);
    // If we don't have any tool state for this imageId, add an empty object

    if (!enabledImage.image || toolState.hasOwnProperty(enabledImage.image.imageId) === false) {
      toolState[enabledImage.image.imageId] = {};
    }

    var imageIdToolState = toolState[enabledImage.image.imageId];

    // If we don't have tool state for this type of tool, add an empty object
    if (imageIdToolState.hasOwnProperty(toolType) === false) {
      imageIdToolState[toolType] = {
        data: []
      };
    }

    var toolData = imageIdToolState[toolType];

    // Finally, add this new tool to the state
    toolData.data.push(data);
  }

  // Here you can get state - used by tools as well as modules
  // That save state persistently
  function getImageIdSpecificToolState(element, toolType) {
    var enabledImage = _externalModules2.default.cornerstone.getEnabledElement(element);
    // If we don't have any tool state for this imageId, return undefined

    if (!enabledImage.image || toolState.hasOwnProperty(enabledImage.image.imageId) === false) {
      return;
    }

    var imageIdToolState = toolState[enabledImage.image.imageId];

    // If we don't have tool state for this type of tool, return undefined
    if (imageIdToolState.hasOwnProperty(toolType) === false) {
      return;
    }

    var toolData = imageIdToolState[toolType];

    return toolData;
  }

  // Clears all tool data from this toolStateManager.
  function clearImageIdSpecificToolStateManager(element) {
    var enabledImage = _externalModules2.default.cornerstone.getEnabledElement(element);

    if (!enabledImage.image || toolState.hasOwnProperty(enabledImage.image.imageId) === false) {
      return;
    }

    delete toolState[enabledImage.image.imageId];
  }

  return {
    get: getImageIdSpecificToolState,
    add: addImageIdSpecificToolState,
    clear: clearImageIdSpecificToolStateManager,
    saveImageIdToolState: saveImageIdToolState,
    restoreImageIdToolState: restoreImageIdToolState,
    saveToolState: saveToolState,
    restoreToolState: restoreToolState,
    toolState: toolState
  };
}

// A global imageIdSpecificToolStateManager - the most common case is to share state between all
// Visible enabled images
var globalImageIdSpecificToolStateManager = newImageIdSpecificToolStateManager();

exports.newImageIdSpecificToolStateManager = newImageIdSpecificToolStateManager;
exports.globalImageIdSpecificToolStateManager = globalImageIdSpecificToolStateManager;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (handle, coords) {
  if (!handle.boundingBox) {
    return;
  }

  return _externalModules2.default.cornerstoneMath.point.insideRect(coords, handle.boundingBox);
};

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (element, handles, coords, distanceThreshold) {
  var nearbyHandle = void 0;

  if (!handles) {
    return;
  }

  Object.keys(handles).forEach(function (name) {
    var handle = handles[name];

    if (handle.hasOwnProperty('pointNearHandle')) {
      if (handle.pointNearHandle(element, handle, coords)) {
        nearbyHandle = handle;

        return;
      }
    } else if (handle.hasBoundingBox === true) {
      if ((0, _pointInsideBoundingBox2.default)(handle, coords)) {
        nearbyHandle = handle;

        return;
      }
    } else {
      var handleCanvas = _externalModules2.default.cornerstone.pixelToCanvas(element, handle);
      var distance = _externalModules2.default.cornerstoneMath.point.distance(handleCanvas, coords);

      if (distance <= distanceThreshold) {
        nearbyHandle = handle;

        return;
      }
    }
  });

  return nearbyHandle;
};

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _pointInsideBoundingBox = __webpack_require__(16);

var _pointInsideBoundingBox2 = _interopRequireDefault(_pointInsideBoundingBox);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var configMaxSimultaneousRequests = void 0;

// Maximum concurrent connections to the same server
// Information from http://sgdev-blog.blogspot.fr/2014/01/maximum-concurrent-connection-to-same.html
var maxSimultaneousRequests = {
  default: 6,
  IE: {
    9: 6,
    10: 8,
    default: 8
  },
  Firefox: {
    default: 6
  },
  Opera: {
    10: 8,
    11: 6,
    12: 6,
    default: 6
  },
  Chrome: {
    default: 6
  },
  Safari: {
    default: 6
  }
};

// Browser name / version detection
// http://stackoverflow.com/questions/2400935/browser-detection-in-javascript
function getBrowserInfo() {
  var ua = navigator.userAgent;
  var M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  var tem = void 0;

  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];

    return 'IE ' + (tem[1] || '');
  }

  if (M[1] === 'Chrome') {
    tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
    if (tem !== null) {
      return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
  }

  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
  if ((tem = ua.match(/version\/(\d+)/i)) !== null) {
    M.splice(1, 1, tem[1]);
  }

  return M.join(' ');
}

function setMaxSimultaneousRequests(newMaxSimultaneousRequests) {
  configMaxSimultaneousRequests = newMaxSimultaneousRequests;
}

function getMaxSimultaneousRequests() {
  if (configMaxSimultaneousRequests) {
    return configMaxSimultaneousRequests;
  }

  return getDefaultSimultaneousRequests();
}

function getDefaultSimultaneousRequests() {
  var infoString = getBrowserInfo();
  var info = infoString.split(' ');
  var browserName = info[0];
  var browserVersion = info[1];
  var browserData = maxSimultaneousRequests[browserName];

  if (!browserData) {
    return maxSimultaneousRequests.default;
  }

  if (!browserData[browserVersion]) {
    return browserData.default;
  }

  return browserData[browserVersion];
}

function isMobileDevice() {
  var pattern = new RegExp('Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini');

  return pattern.test(navigator.userAgent);
}

exports.getDefaultSimultaneousRequests = getDefaultSimultaneousRequests;
exports.getMaxSimultaneousRequests = getMaxSimultaneousRequests;
exports.setMaxSimultaneousRequests = setMaxSimultaneousRequests;
exports.getBrowserInfo = getBrowserInfo;
exports.isMobileDevice = isMobileDevice;

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (image, storedPixelValue) {
  var cornerstone = _externalModules2.default.cornerstone;
  var patientStudyModule = cornerstone.metaData.get('patientStudyModule', image.imageId);
  var seriesModule = cornerstone.metaData.get('generalSeriesModule', image.imageId);

  if (!patientStudyModule || !seriesModule) {
    return;
  }

  var modality = seriesModule.modality;

  // Image must be PET
  if (modality !== 'PT') {
    return;
  }

  var modalityPixelValue = storedPixelValue * image.slope + image.intercept;

  var patientWeight = patientStudyModule.patientWeight; // In kg

  if (!patientWeight) {
    return;
  }

  var petSequenceModule = cornerstone.metaData.get('petIsotopeModule', image.imageId);

  if (!petSequenceModule) {
    return;
  }

  var radiopharmaceuticalInfo = petSequenceModule.radiopharmaceuticalInfo;
  var startTime = radiopharmaceuticalInfo.radiopharmaceuticalStartTime;
  var totalDose = radiopharmaceuticalInfo.radionuclideTotalDose;
  var halfLife = radiopharmaceuticalInfo.radionuclideHalfLife;
  var seriesAcquisitionTime = seriesModule.seriesTime;

  if (!startTime || !totalDose || !halfLife || !seriesAcquisitionTime) {
    return;
  }

  var acquisitionTimeInSeconds = fracToDec(seriesAcquisitionTime.fractionalSeconds || 0) + seriesAcquisitionTime.seconds + seriesAcquisitionTime.minutes * 60 + seriesAcquisitionTime.hours * 60 * 60;
  var injectionStartTimeInSeconds = fracToDec(startTime.fractionalSeconds) + startTime.seconds + startTime.minutes * 60 + startTime.hours * 60 * 60;
  var durationInSeconds = acquisitionTimeInSeconds - injectionStartTimeInSeconds;
  var correctedDose = totalDose * Math.exp(-durationInSeconds * Math.log(2) / halfLife);
  var suv = modalityPixelValue * patientWeight / correctedDose * 1000;

  return suv;
};

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Returns a decimal value given a fractional value
function fracToDec(fractionalValue) {
  return parseFloat('.' + fractionalValue);
}

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _getMaxSimultaneousRequests = __webpack_require__(18);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var requestPool = {
  interaction: [],
  thumbnail: [],
  prefetch: []
};

var numRequests = {
  interaction: 0,
  thumbnail: 0,
  prefetch: 0
};

var maxNumRequests = {
  interaction: 6,
  thumbnail: 6,
  prefetch: 5
};

var awake = false;
var grabDelay = 20;

function addRequest(element, imageId, type, preventCache, doneCallback, failCallback, addToBeginning) {
  if (!requestPool.hasOwnProperty(type)) {
    throw new Error('Request type must be one of interaction, thumbnail, or prefetch');
  }

  if (!element || !imageId) {
    return;
  }

  // Describe the request
  var requestDetails = {
    type: type,
    imageId: imageId,
    preventCache: preventCache,
    doneCallback: doneCallback,
    failCallback: failCallback
  };

  // If this imageId is in the cache, resolve it immediately
  var imageLoadObject = _externalModules2.default.cornerstone.imageCache.getImageLoadObject(imageId);

  if (imageLoadObject) {
    imageLoadObject.promise.then(function (image) {
      doneCallback(image);
    }, function (error) {
      failCallback(error);
    });

    return;
  }

  if (addToBeginning) {
    // Add it to the beginning of the stack
    requestPool[type].unshift(requestDetails);
  } else {
    // Add it to the end of the stack
    requestPool[type].push(requestDetails);
  }
}

function clearRequestStack(type) {
  // Console.log('clearRequestStack');
  if (!requestPool.hasOwnProperty(type)) {
    throw new Error('Request type must be one of interaction, thumbnail, or prefetch');
  }

  requestPool[type] = [];
}

function startAgain() {
  if (!awake) {
    return;
  }

  setTimeout(function () {
    startGrabbing();
  }, grabDelay);
}

function sendRequest(requestDetails) {
  var cornerstone = _externalModules2.default.cornerstone;
  // Increment the number of current requests of this type
  var type = requestDetails.type;

  numRequests[type]++;

  awake = true;
  var imageId = requestDetails.imageId;
  var doneCallback = requestDetails.doneCallback;
  var failCallback = requestDetails.failCallback;

  // Check if we already have this image promise in the cache
  var imageLoadObject = cornerstone.imageCache.getImageLoadObject(imageId);

  if (imageLoadObject) {
    // If we do, remove from list (when resolved, as we could have
    // Pending prefetch requests) and stop processing this iteration
    imageLoadObject.promise.then(function (image) {
      numRequests[type]--;
      // Console.log(numRequests);

      doneCallback(image);
      startAgain();
    }, function (error) {
      numRequests[type]--;
      // Console.log(numRequests);
      failCallback(error);
      startAgain();
    });

    return;
  }

  function requestTypeToLoadPriority(requestDetails) {
    if (requestDetails.type === 'prefetch') {
      return -5;
    } else if (requestDetails.type === 'interactive') {
      return 0;
    } else if (requestDetails.type === 'thumbnail') {
      return 5;
    }
  }

  var priority = requestTypeToLoadPriority(requestDetails);

  var loader = void 0;

  if (requestDetails.preventCache === true) {
    loader = cornerstone.loadImage(imageId, {
      priority: priority,
      type: requestDetails.type
    });
  } else {
    loader = cornerstone.loadAndCacheImage(imageId, {
      priority: priority,
      type: requestDetails.type
    });
  }

  // Load and cache the image
  loader.then(function (image) {
    numRequests[type]--;
    // Console.log(numRequests);
    doneCallback(image);
    startAgain();
  }, function (error) {
    numRequests[type]--;
    // Console.log(numRequests);
    failCallback(error);
    startAgain();
  });
}

function startGrabbing() {
  // Begin by grabbing X images
  var maxSimultaneousRequests = (0, _getMaxSimultaneousRequests.getMaxSimultaneousRequests)();

  maxNumRequests = {
    interaction: Math.max(maxSimultaneousRequests, 1),
    thumbnail: Math.max(maxSimultaneousRequests - 2, 1),
    prefetch: Math.max(maxSimultaneousRequests - 1, 1)
  };

  var currentRequests = numRequests.interaction + numRequests.thumbnail + numRequests.prefetch;
  var requestsToSend = maxSimultaneousRequests - currentRequests;

  for (var i = 0; i < requestsToSend; i++) {
    var requestDetails = getNextRequest();

    if (requestDetails) {
      sendRequest(requestDetails);
    }
  }
}

function getNextRequest() {
  if (requestPool.interaction.length && numRequests.interaction < maxNumRequests.interaction) {
    return requestPool.interaction.shift();
  }

  if (requestPool.thumbnail.length && numRequests.thumbnail < maxNumRequests.thumbnail) {
    return requestPool.thumbnail.shift();
  }

  if (requestPool.prefetch.length && numRequests.prefetch < maxNumRequests.prefetch) {
    return requestPool.prefetch.shift();
  }

  if (!requestPool.interaction.length && !requestPool.thumbnail.length && !requestPool.prefetch.length) {
    awake = false;
  }

  return false;
}

function getRequestPool() {
  return requestPool;
}

exports.default = {
  addRequest: addRequest,
  clearRequestStack: clearRequestStack,
  startGrabbing: startGrabbing,
  getRequestPool: getRequestPool
};

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (ellipse, location) {
  var xRadius = ellipse.width / 2;
  var yRadius = ellipse.height / 2;

  if (xRadius <= 0.0 || yRadius <= 0.0) {
    return false;
  }

  var center = {
    x: ellipse.left + xRadius,
    y: ellipse.top + yRadius
  };

  /* This is a more general form of the circle equation
   *
   * X^2/a^2 + Y^2/b^2 <= 1
   */

  var normalized = {
    x: location.x - center.x,
    y: location.y - center.y
  };

  var inEllipse = normalized.x * normalized.x / (xRadius * xRadius) + normalized.y * normalized.y / (yRadius * yRadius) <= 1.0;

  return inEllipse;
};

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (mouseEventData, toolType, data, handle, doneMovingCallback, preventHandleOutsideImage) {
  var cornerstone = _externalModules2.default.cornerstone;
  var element = mouseEventData.element;
  var distanceFromTool = {
    x: handle.x - mouseEventData.currentPoints.image.x,
    y: handle.y - mouseEventData.currentPoints.image.y
  };

  function mouseDragCallback(e) {
    var eventData = e.detail;

    if (handle.hasMoved === false) {
      handle.hasMoved = true;
    }

    handle.active = true;
    handle.x = eventData.currentPoints.image.x + distanceFromTool.x;
    handle.y = eventData.currentPoints.image.y + distanceFromTool.y;

    if (preventHandleOutsideImage) {
      handle.x = Math.max(handle.x, 0);
      handle.x = Math.min(handle.x, eventData.image.width);

      handle.y = Math.max(handle.y, 0);
      handle.y = Math.min(handle.y, eventData.image.height);
    }

    cornerstone.updateImage(element);

    var eventType = _events2.default.MEASUREMENT_MODIFIED;
    var modifiedEventData = {
      toolType: toolType,
      element: element,
      measurementData: data
    };

    (0, _triggerEvent2.default)(element, eventType, modifiedEventData);
  }

  element.addEventListener(_events2.default.MOUSE_DRAG, mouseDragCallback);

  function mouseUpCallback() {
    handle.active = false;
    element.removeEventListener(_events2.default.MOUSE_DRAG, mouseDragCallback);
    element.removeEventListener(_events2.default.MOUSE_UP, mouseUpCallback);
    element.removeEventListener(_events2.default.MOUSE_CLICK, mouseUpCallback);
    cornerstone.updateImage(element);

    if (typeof doneMovingCallback === 'function') {
      doneMovingCallback();
    }
  }

  element.addEventListener(_events2.default.MOUSE_UP, mouseUpCallback);
  element.addEventListener(_events2.default.MOUSE_CLICK, mouseUpCallback);
};

var _events = __webpack_require__(1);

var _events2 = _interopRequireDefault(_events);

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _triggerEvent = __webpack_require__(3);

var _triggerEvent2 = _interopRequireDefault(_triggerEvent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (mouseEventData, toolType, data, handle, doneMovingCallback, preventHandleOutsideImage) {
  var cornerstone = _externalModules2.default.cornerstone;
  var element = mouseEventData.element;

  function moveCallback(e) {
    var eventData = e.detail;

    handle.active = true;
    handle.x = eventData.currentPoints.image.x;
    handle.y = eventData.currentPoints.image.y;

    if (preventHandleOutsideImage) {
      handle.x = Math.max(handle.x, 0);
      handle.x = Math.min(handle.x, eventData.image.width);

      handle.y = Math.max(handle.y, 0);
      handle.y = Math.min(handle.y, eventData.image.height);
    }

    cornerstone.updateImage(element);

    var eventType = _events2.default.MEASUREMENT_MODIFIED;
    var modifiedEventData = {
      toolType: toolType,
      element: element,
      measurementData: data
    };

    (0, _triggerEvent2.default)(element, eventType, modifiedEventData);
  }

  function whichMovement(e) {
    element.removeEventListener(_events2.default.MOUSE_MOVE, whichMovement);
    element.removeEventListener(_events2.default.MOUSE_DRAG, whichMovement);

    element.addEventListener(_events2.default.MOUSE_MOVE, moveCallback);
    element.addEventListener(_events2.default.MOUSE_DRAG, moveCallback);

    element.addEventListener(_events2.default.MOUSE_CLICK, moveEndCallback);
    if (e.type === _events2.default.MOUSE_DRAG) {
      element.addEventListener(_events2.default.MOUSE_UP, moveEndCallback);
    }
  }

  function measurementRemovedCallback(e) {
    var eventData = e.detail;

    if (eventData.measurementData === data) {
      moveEndCallback();
    }
  }

  function toolDeactivatedCallback(e) {
    var eventData = e.detail;

    if (eventData.toolType === toolType) {
      element.removeEventListener(_events2.default.MOUSE_MOVE, moveCallback);
      element.removeEventListener(_events2.default.MOUSE_DRAG, moveCallback);
      element.removeEventListener(_events2.default.MOUSE_CLICK, moveEndCallback);
      element.removeEventListener(_events2.default.MOUSE_UP, moveEndCallback);
      element.removeEventListener(_events2.default.MEASUREMENT_REMOVED, measurementRemovedCallback);
      element.removeEventListener(_events2.default.TOOL_DEACTIVATED, toolDeactivatedCallback);

      handle.active = false;
      cornerstone.updateImage(element);
    }
  }

  element.addEventListener(_events2.default.MOUSE_DRAG, whichMovement);
  element.addEventListener(_events2.default.MOUSE_MOVE, whichMovement);
  element.addEventListener(_events2.default.MEASUREMENT_REMOVED, measurementRemovedCallback);
  element.addEventListener(_events2.default.TOOL_DEACTIVATED, toolDeactivatedCallback);

  function moveEndCallback() {
    element.removeEventListener(_events2.default.MOUSE_MOVE, moveCallback);
    element.removeEventListener(_events2.default.MOUSE_DRAG, moveCallback);
    element.removeEventListener(_events2.default.MOUSE_CLICK, moveEndCallback);
    element.removeEventListener(_events2.default.MOUSE_UP, moveEndCallback);
    element.removeEventListener(_events2.default.MEASUREMENT_REMOVED, measurementRemovedCallback);
    element.removeEventListener(_events2.default.TOOL_DEACTIVATED, toolDeactivatedCallback);

    handle.active = false;
    cornerstone.updateImage(element);

    if (typeof doneMovingCallback === 'function') {
      doneMovingCallback();
    }
  }
};

var _events = __webpack_require__(1);

var _events2 = _interopRequireDefault(_events);

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _triggerEvent = __webpack_require__(3);

var _triggerEvent2 = _interopRequireDefault(_triggerEvent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (eventData, toolType, data, handle, doneMovingCallback, preventHandleOutsideImage) {
  // Console.log('moveNewHandleTouch');
  var cornerstone = _externalModules2.default.cornerstone;
  var element = eventData.element;
  var imageCoords = cornerstone.pageToPixel(element, eventData.currentPoints.page.x, eventData.currentPoints.page.y + 50);
  var distanceFromTouch = {
    x: handle.x - imageCoords.x,
    y: handle.y - imageCoords.y
  };

  handle.active = true;
  data.active = true;

  function moveCallback(e) {
    var eventData = e.detail;

    handle.x = eventData.currentPoints.image.x + distanceFromTouch.x;
    handle.y = eventData.currentPoints.image.y + distanceFromTouch.y;

    if (preventHandleOutsideImage) {
      handle.x = Math.max(handle.x, 0);
      handle.x = Math.min(handle.x, eventData.image.width);

      handle.y = Math.max(handle.y, 0);
      handle.y = Math.min(handle.y, eventData.image.height);
    }

    cornerstone.updateImage(element);

    var eventType = _events2.default.MEASUREMENT_MODIFIED;
    var modifiedEventData = {
      toolType: toolType,
      element: element,
      measurementData: data
    };

    (0, _triggerEvent2.default)(element, eventType, modifiedEventData);
  }

  function moveEndCallback(e) {
    var eventData = e.detail;

    element.removeEventListener(_events2.default.TOUCH_DRAG, moveCallback);
    element.removeEventListener(_events2.default.TOUCH_PINCH, moveEndCallback);
    element.removeEventListener(_events2.default.TOUCH_END, moveEndCallback);
    element.removeEventListener(_events2.default.TAP, moveEndCallback);
    element.removeEventListener(_events2.default.TOUCH_START, stopImmediatePropagation);
    element.removeEventListener(_events2.default.TOOL_DEACTIVATED, toolDeactivatedCallback);

    if (e.type === _events2.default.TOUCH_PINCH || e.type === _events2.default.TOUCH_PRESS) {
      handle.active = false;
      cornerstone.updateImage(element);
      doneMovingCallback();

      return;
    }

    handle.active = false;
    data.active = false;
    handle.x = eventData.currentPoints.image.x + distanceFromTouch.x;
    handle.y = eventData.currentPoints.image.y + distanceFromTouch.y;

    if (preventHandleOutsideImage) {
      handle.x = Math.max(handle.x, 0);
      handle.x = Math.min(handle.x, eventData.image.width);

      handle.y = Math.max(handle.y, 0);
      handle.y = Math.min(handle.y, eventData.image.height);
    }

    cornerstone.updateImage(element);

    if (typeof doneMovingCallback === 'function') {
      doneMovingCallback();
    }
  }

  function stopImmediatePropagation(e) {
    // Stop the CornerstoneToolsTouchStart event from
    // Become a CornerstoneToolsTouchStartActive event when
    // MoveNewHandleTouch ends
    e.stopImmediatePropagation();

    return false;
  }

  element.addEventListener(_events2.default.TOUCH_DRAG, moveCallback);
  element.addEventListener(_events2.default.TOUCH_PINCH, moveEndCallback);
  element.addEventListener(_events2.default.TOUCH_END, moveEndCallback);
  element.addEventListener(_events2.default.TAP, moveEndCallback);
  element.addEventListener(_events2.default.TOUCH_START, stopImmediatePropagation);

  function toolDeactivatedCallback() {
    element.removeEventListener(_events2.default.TOUCH_DRAG, moveCallback);
    element.removeEventListener(_events2.default.TOUCH_PINCH, moveEndCallback);
    element.removeEventListener(_events2.default.TOUCH_END, moveEndCallback);
    element.removeEventListener(_events2.default.TAP, moveEndCallback);
    element.removeEventListener(_events2.default.TOUCH_START, stopImmediatePropagation);
    element.removeEventListener(_events2.default.TOOL_DEACTIVATED, toolDeactivatedCallback);

    handle.active = false;
    data.active = false;
    handle.x = eventData.currentPoints.image.x + distanceFromTouch.x;
    handle.y = eventData.currentPoints.image.y + distanceFromTouch.y;

    if (preventHandleOutsideImage) {
      handle.x = Math.max(handle.x, 0);
      handle.x = Math.min(handle.x, eventData.image.width);

      handle.y = Math.max(handle.y, 0);
      handle.y = Math.min(handle.y, eventData.image.height);
    }

    cornerstone.updateImage(element);
  }

  element.addEventListener(_events2.default.TOOL_DEACTIVATED, toolDeactivatedCallback);
};

var _events = __webpack_require__(1);

var _events2 = _interopRequireDefault(_events);

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _triggerEvent = __webpack_require__(3);

var _triggerEvent2 = _interopRequireDefault(_triggerEvent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.projectPatientPointToImagePlane = projectPatientPointToImagePlane;
exports.imagePointToPatientPoint = imagePointToPatientPoint;
exports.planePlaneIntersection = planePlaneIntersection;

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _convertToVector = __webpack_require__(14);

var _convertToVector2 = _interopRequireDefault(_convertToVector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Projects a patient point to an image point
function projectPatientPointToImagePlane(patientPoint, imagePlane) {
  var rowCosines = (0, _convertToVector2.default)(imagePlane.rowCosines);
  var columnCosines = (0, _convertToVector2.default)(imagePlane.columnCosines);
  var imagePositionPatient = (0, _convertToVector2.default)(imagePlane.imagePositionPatient);
  var point = patientPoint.clone().sub(imagePositionPatient);
  var x = rowCosines.dot(point) / imagePlane.columnPixelSpacing;
  var y = columnCosines.dot(point) / imagePlane.rowPixelSpacing;

  return {
    x: x,
    y: y
  };
}

// Projects an image point to a patient point
function imagePointToPatientPoint(imagePoint, imagePlane) {
  var rowCosines = (0, _convertToVector2.default)(imagePlane.rowCosines);
  var columnCosines = (0, _convertToVector2.default)(imagePlane.columnCosines);
  var imagePositionPatient = (0, _convertToVector2.default)(imagePlane.imagePositionPatient);

  var x = rowCosines.clone().multiplyScalar(imagePoint.x);

  x.multiplyScalar(imagePlane.columnPixelSpacing);
  var y = columnCosines.clone().multiplyScalar(imagePoint.y);

  y.multiplyScalar(imagePlane.rowPixelSpacing);
  var patientPoint = x.add(y);

  patientPoint.add(imagePositionPatient);

  return patientPoint;
}

function getRectangleFromImagePlane(imagePlane) {
  // Get the points
  var topLeft = imagePointToPatientPoint({
    x: 0,
    y: 0
  }, imagePlane);
  var topRight = imagePointToPatientPoint({
    x: imagePlane.columns,
    y: 0
  }, imagePlane);
  var bottomLeft = imagePointToPatientPoint({
    x: 0,
    y: imagePlane.rows
  }, imagePlane);
  var bottomRight = imagePointToPatientPoint({
    x: imagePlane.columns,
    y: imagePlane.rows
  }, imagePlane);

  // Get each side as a vector
  var rect = {
    top: new _externalModules2.default.cornerstoneMath.Line3(topLeft, topRight),
    left: new _externalModules2.default.cornerstoneMath.Line3(topLeft, bottomLeft),
    right: new _externalModules2.default.cornerstoneMath.Line3(topRight, bottomRight),
    bottom: new _externalModules2.default.cornerstoneMath.Line3(bottomLeft, bottomRight)
  };

  return rect;
}

function lineRectangleIntersection(line, rect) {
  var intersections = [];

  Object.keys(rect).forEach(function (side) {
    var segment = rect[side];
    var intersection = line.intersectLine(segment);

    if (intersection) {
      intersections.push(intersection);
    }
  });

  return intersections;
}

// Gets the line of intersection between two planes in patient space
function planePlaneIntersection(targetImagePlane, referenceImagePlane) {
  var targetRowCosines = (0, _convertToVector2.default)(targetImagePlane.rowCosines);
  var targetColumnCosines = (0, _convertToVector2.default)(targetImagePlane.columnCosines);
  var targetImagePositionPatient = (0, _convertToVector2.default)(targetImagePlane.imagePositionPatient);
  var referenceRowCosines = (0, _convertToVector2.default)(referenceImagePlane.rowCosines);
  var referenceColumnCosines = (0, _convertToVector2.default)(referenceImagePlane.columnCosines);
  var referenceImagePositionPatient = (0, _convertToVector2.default)(referenceImagePlane.imagePositionPatient);

  // First, get the normals of each image plane
  var targetNormal = targetRowCosines.clone().cross(targetColumnCosines);
  var targetPlane = new _externalModules2.default.cornerstoneMath.Plane();

  targetPlane.setFromNormalAndCoplanarPoint(targetNormal, targetImagePositionPatient);

  var referenceNormal = referenceRowCosines.clone().cross(referenceColumnCosines);
  var referencePlane = new _externalModules2.default.cornerstoneMath.Plane();

  referencePlane.setFromNormalAndCoplanarPoint(referenceNormal, referenceImagePositionPatient);

  var originDirection = referencePlane.clone().intersectPlane(targetPlane);
  var origin = originDirection.origin;
  var direction = originDirection.direction;

  // Calculate the longest possible length in the reference image plane (the length of the diagonal)
  var bottomRight = imagePointToPatientPoint({
    x: referenceImagePlane.columns,
    y: referenceImagePlane.rows
  }, referenceImagePlane);
  var distance = referenceImagePositionPatient.distanceTo(bottomRight);

  // Use this distance to bound the ray intersecting the two planes
  var line = new _externalModules2.default.cornerstoneMath.Line3();

  line.start = origin;
  line.end = origin.clone().add(direction.multiplyScalar(distance));

  // Find the intersections between this line and the reference image plane's four sides
  var rect = getRectangleFromImagePlane(referenceImagePlane);
  var intersections = lineRectangleIntersection(line, rect);

  // Return the intersections between this line and the reference image plane's sides
  // In order to draw the reference line from the target image.
  if (intersections.length !== 2) {
    return;
  }

  return {
    start: intersections[0],
    end: intersections[1]
  };
}

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (element, newImageIdIndex) {
  var toolData = (0, _toolState.getToolState)(element, 'stack');

  if (!toolData || !toolData.data || !toolData.data.length) {
    return;
  }

  var cornerstone = _externalModules2.default.cornerstone;
  // If we have more than one stack, check if we have a stack renderer defined
  var stackRenderer = void 0;

  if (toolData.data.length > 1) {
    var stackRendererData = (0, _toolState.getToolState)(element, 'stackRenderer');

    if (stackRendererData && stackRendererData.data && stackRendererData.data.length) {
      stackRenderer = stackRendererData.data[0];
    }
  }

  var stackData = toolData.data[0];

  // Allow for negative indexing
  if (newImageIdIndex < 0) {
    newImageIdIndex += stackData.imageIds.length;
  }

  var startLoadingHandler = _loadHandlerManager2.default.getStartLoadHandler();
  var endLoadingHandler = _loadHandlerManager2.default.getEndLoadHandler();
  var errorLoadingHandler = _loadHandlerManager2.default.getErrorLoadingHandler();

  function doneCallback(image) {
    if (stackData.currentImageIdIndex !== newImageIdIndex) {
      return;
    }

    // Check if the element is still enabled in Cornerstone,
    // If an error is thrown, stop here.
    try {
      // TODO: Add 'isElementEnabled' to Cornerstone?
      cornerstone.getEnabledElement(element);
    } catch (error) {
      return;
    }

    if (stackRenderer) {
      stackRenderer.currentImageIdIndex = newImageIdIndex;
      stackRenderer.render(element, toolData.data);
    } else {
      cornerstone.displayImage(element, image);
    }

    if (endLoadingHandler) {
      endLoadingHandler(element, image);
    }
  }

  function failCallback(error) {
    var imageId = stackData.imageIds[newImageIdIndex];

    if (errorLoadingHandler) {
      errorLoadingHandler(element, imageId, error);
    }
  }

  if (newImageIdIndex === stackData.currentImageIdIndex) {
    return;
  }

  if (startLoadingHandler) {
    startLoadingHandler(element);
  }

  var eventData = {
    newImageIdIndex: newImageIdIndex,
    direction: newImageIdIndex - stackData.currentImageIdIndex
  };

  stackData.currentImageIdIndex = newImageIdIndex;
  var newImageId = stackData.imageIds[newImageIdIndex];

  // Retry image loading in cases where previous image promise
  // Was rejected, if the option is set
  /*
     Const config = stackScroll.getConfiguration();
     TODO: Revisit this. It appears that Core's imageCache is not
    keeping rejected promises anywhere, so we have no way to know
    if something was previously rejected.
     if (config && config.retryLoadOnScroll === true) {
    }
  */

  // Convert the preventCache value in stack data to a boolean
  var preventCache = Boolean(stackData.preventCache);

  var imagePromise = void 0;

  if (preventCache) {
    imagePromise = cornerstone.loadImage(newImageId);
  } else {
    imagePromise = cornerstone.loadAndCacheImage(newImageId);
  }

  imagePromise.then(doneCallback, failCallback);
  // Make sure we kick off any changed download request pools
  _requestPoolManager2.default.startGrabbing();

  (0, _triggerEvent2.default)(element, _events2.default.STACK_SCROLL, eventData);
};

var _events = __webpack_require__(1);

var _events2 = _interopRequireDefault(_events);

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _toolState = __webpack_require__(2);

var _requestPoolManager = __webpack_require__(20);

var _requestPoolManager2 = _interopRequireDefault(_requestPoolManager);

var _loadHandlerManager = __webpack_require__(11);

var _loadHandlerManager2 = _interopRequireDefault(_loadHandlerManager);

var _triggerEvent = __webpack_require__(3);

var _triggerEvent2 = _interopRequireDefault(_triggerEvent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (element, images) {
  var loop = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var allowSkipping = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

  var toolData = (0, _toolState.getToolState)(element, 'stack');

  if (!toolData || !toolData.data || !toolData.data.length) {
    return;
  }

  var stackData = toolData.data[0];

  if (!stackData.pending) {
    stackData.pending = [];
  }

  var newImageIdIndex = stackData.currentImageIdIndex + images;

  if (loop) {
    var nbImages = stackData.imageIds.length;

    newImageIdIndex %= nbImages;
  } else {
    newImageIdIndex = Math.min(stackData.imageIds.length - 1, newImageIdIndex);
    newImageIdIndex = Math.max(0, newImageIdIndex);
  }

  if (allowSkipping) {
    (0, _scrollToIndex2.default)(element, newImageIdIndex);
  } else {
    var pendingEvent = {
      index: newImageIdIndex
    };

    stackData.pending.push(pendingEvent);
    scrollWithoutSkipping(stackData, pendingEvent, element);
  }
};

var _scrollToIndex = __webpack_require__(26);

var _scrollToIndex2 = _interopRequireDefault(_scrollToIndex);

var _toolState = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function scrollWithoutSkipping(stackData, pendingEvent, element) {
  if (stackData.pending[0] === pendingEvent) {
    if (stackData.currentImageIdIndex === pendingEvent.index) {
      stackData.pending.splice(stackData.pending.indexOf(pendingEvent), 1);

      if (stackData.pending.length > 0) {
        scrollWithoutSkipping(stackData, stackData.pending[0], element);
      }

      return;
    }

    var newImageHandler = function newImageHandler(event) {
      var index = stackData.imageIds.indexOf(event.detail.image.imageId);

      if (index === pendingEvent.index) {
        stackData.pending.splice(stackData.pending.indexOf(pendingEvent), 1);
        element.removeEventListener('cornerstonenewimage', newImageHandler);

        if (stackData.pending.length > 0) {
          scrollWithoutSkipping(stackData, stackData.pending[0], element);
        }
      }
    };

    element.addEventListener('cornerstonenewimage', newImageHandler);

    (0, _scrollToIndex2.default)(element, pendingEvent.index);
  }
}

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (value, precision) {
  var multiplier = Math.pow(10, precision);

  return Math.round(value * multiplier) / multiplier;
};

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (element, x, y, width, height) {
  if (!element) {
    throw new Error('getRGBPixels: parameter element must not be undefined');
  }

  x = Math.round(x);
  y = Math.round(y);
  var enabledElement = _externalModules2.default.cornerstone.getEnabledElement(element);
  var storedPixelData = [];
  var index = 0;
  var pixelData = enabledElement.image.getPixelData();
  var spIndex = void 0,
      row = void 0,
      column = void 0;

  if (enabledElement.image.color) {
    for (row = 0; row < height; row++) {
      for (column = 0; column < width; column++) {
        spIndex = ((row + y) * enabledElement.image.columns + (column + x)) * 4;
        var red = pixelData[spIndex];
        var green = pixelData[spIndex + 1];
        var blue = pixelData[spIndex + 2];
        var alpha = pixelData[spIndex + 3];

        storedPixelData[index++] = red;
        storedPixelData[index++] = green;
        storedPixelData[index++] = blue;
        storedPixelData[index++] = alpha;
      }
    }
  }

  return storedPixelData;
};

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var coordsData = void 0;

function setCoords(eventData) {
  coordsData = eventData.currentPoints.canvas;
}

function getCoords() {
  return coordsData;
}

var toolCoordinates = {
  setCoords: setCoords,
  getCoords: getCoords
};

exports.default = toolCoordinates;

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (element, handles, canvasPoint, distanceThreshold) {
  if (!distanceThreshold) {
    distanceThreshold = 6;
  }

  var activeHandle = getActiveHandle(handles);
  var nearbyHandle = (0, _getHandleNearImagePoint2.default)(element, handles, canvasPoint, distanceThreshold);

  if (activeHandle !== nearbyHandle) {
    if (nearbyHandle !== undefined) {
      nearbyHandle.active = true;
    }

    if (activeHandle !== undefined) {
      activeHandle.active = false;
    }

    return true;
  }

  return false;
};

var _getHandleNearImagePoint = __webpack_require__(17);

var _getHandleNearImagePoint2 = _interopRequireDefault(_getHandleNearImagePoint);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getActiveHandle(handles) {
  var activeHandle = void 0;

  Object.keys(handles).forEach(function (name) {
    var handle = handles[name];

    if (handle.active === true) {
      activeHandle = handle;

      return;
    }
  });

  return activeHandle;
}

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (e, data, toolData, toolType, options, doneMovingCallback) {
  var cornerstone = _externalModules2.default.cornerstone;
  var mouseEventData = e.detail;
  var element = mouseEventData.element;

  function mouseDragCallback(e) {
    var eventData = e.detail;

    data.active = true;

    Object.keys(data.handles).forEach(function (name) {
      var handle = data.handles[name];

      if (handle.movesIndependently === true) {
        return;
      }

      handle.x += eventData.deltaPoints.image.x;
      handle.y += eventData.deltaPoints.image.y;

      if (options.preventHandleOutsideImage === true) {
        handle.x = Math.max(handle.x, 0);
        handle.x = Math.min(handle.x, eventData.image.width);

        handle.y = Math.max(handle.y, 0);
        handle.y = Math.min(handle.y, eventData.image.height);
      }
    });

    cornerstone.updateImage(element);

    var eventType = _events2.default.MEASUREMENT_MODIFIED;
    var modifiedEventData = {
      toolType: toolType,
      element: element,
      measurementData: data
    };

    (0, _triggerEvent2.default)(element, eventType, modifiedEventData);

    e.preventDefault();
    e.stopPropagation();
  }

  element.addEventListener(_events2.default.MOUSE_DRAG, mouseDragCallback);

  function mouseUpCallback(e) {
    var eventData = e.detail;

    data.invalidated = true;

    element.removeEventListener(_events2.default.MOUSE_DRAG, mouseDragCallback);
    element.removeEventListener(_events2.default.MOUSE_UP, mouseUpCallback);
    element.removeEventListener(_events2.default.MOUSE_CLICK, mouseUpCallback);

    // If any handle is outside the image, delete the tool data
    if (options.deleteIfHandleOutsideImage === true && (0, _anyHandlesOutsideImage2.default)(eventData, data.handles)) {
      (0, _toolState.removeToolState)(element, toolType, data);
    }

    cornerstone.updateImage(element);

    if (typeof doneMovingCallback === 'function') {
      doneMovingCallback();
    }
  }

  element.addEventListener(_events2.default.MOUSE_UP, mouseUpCallback);
  element.addEventListener(_events2.default.MOUSE_CLICK, mouseUpCallback);

  return true;
};

var _events = __webpack_require__(1);

var _events2 = _interopRequireDefault(_events);

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _anyHandlesOutsideImage = __webpack_require__(12);

var _anyHandlesOutsideImage2 = _interopRequireDefault(_anyHandlesOutsideImage);

var _toolState = __webpack_require__(2);

var _triggerEvent = __webpack_require__(3);

var _triggerEvent2 = _interopRequireDefault(_triggerEvent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 33 */,
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getOrientationString = __webpack_require__(35);

var _getOrientationString2 = _interopRequireDefault(_getOrientationString);

var _invertOrientationString = __webpack_require__(36);

var _invertOrientationString2 = _interopRequireDefault(_invertOrientationString);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var orientation = {
  getOrientationString: _getOrientationString2.default,
  invertOrientationString: _invertOrientationString2.default
};

exports.default = orientation;

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (vector) {
  var vec3 = (0, _convertToVector2.default)(vector);

  // Thanks to David Clunie
  // https://sites.google.com/site/dicomnotes/

  var orientation = '';
  var orientationX = vec3.x < 0 ? 'R' : 'L';
  var orientationY = vec3.y < 0 ? 'A' : 'P';
  var orientationZ = vec3.z < 0 ? 'F' : 'H';

  // Should probably make this a function vector3.abs
  var abs = new _externalModules2.default.cornerstoneMath.Vector3(Math.abs(vec3.x), Math.abs(vec3.y), Math.abs(vec3.z));

  for (var i = 0; i < 3; i++) {
    if (abs.x > 0.0001 && abs.x > abs.y && abs.x > abs.z) {
      orientation += orientationX;
      abs.x = 0;
    } else if (abs.y > 0.0001 && abs.y > abs.x && abs.y > abs.z) {
      orientation += orientationY;
      abs.y = 0;
    } else if (abs.z > 0.0001 && abs.z > abs.x && abs.z > abs.y) {
      orientation += orientationZ;
      abs.z = 0;
    } else {
      break;
    }
  }

  return orientation;
};

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _convertToVector = __webpack_require__(14);

var _convertToVector2 = _interopRequireDefault(_convertToVector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (string) {
  var inverted = string.replace('H', 'f');

  inverted = inverted.replace('F', 'h');
  inverted = inverted.replace('R', 'l');
  inverted = inverted.replace('L', 'r');
  inverted = inverted.replace('A', 'p');
  inverted = inverted.replace('P', 'a');
  inverted = inverted.toUpperCase();

  return inverted;
};

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (element, x, y, width, height) {
  if (!element) {
    throw new Error('getLuminance: parameter element must not be undefined');
  }

  x = Math.round(x);
  y = Math.round(y);
  var enabledElement = _externalModules2.default.cornerstone.getEnabledElement(element);
  var image = enabledElement.image;
  var luminance = [];
  var index = 0;
  var pixelData = image.getPixelData();
  var spIndex = void 0,
      row = void 0,
      column = void 0;

  if (image.color) {
    for (row = 0; row < height; row++) {
      for (column = 0; column < width; column++) {
        spIndex = ((row + y) * image.columns + (column + x)) * 4;
        var red = pixelData[spIndex];
        var green = pixelData[spIndex + 1];
        var blue = pixelData[spIndex + 2];

        luminance[index++] = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
      }
    }
  } else {
    for (row = 0; row < height; row++) {
      for (column = 0; column < width; column++) {
        spIndex = (row + y) * image.columns + (column + x);
        luminance[index++] = pixelData[spIndex] * image.slope + image.intercept;
      }
    }
  }

  return luminance;
};

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (context, x, y, w, h) {
  var kappa = 0.5522848,
      ox = w / 2 * kappa,
      // Control point offset horizontal
  oy = h / 2 * kappa,
      // Control point offset vertical
  xe = x + w,
      // X-end
  ye = y + h,
      // Y-end
  xm = x + w / 2,
      // X-middle
  ym = y + h / 2; // Y-middle

  context.beginPath();
  context.moveTo(x, ym);
  context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
  context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
  context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
  context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
  context.closePath();
  context.stroke();
};

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (context, start, color, lineWidth) {
  var handleRadius = 6;

  context.beginPath();
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  context.arc(start.x, start.y, handleRadius, 0, 2 * Math.PI);
  context.stroke();
};

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (context, start, end, color, lineWidth) {
  // Variables to be used when creating the arrow
  var headLength = 10;

  var angle = Math.atan2(end.y - start.y, end.x - start.x);

  // Starting path of the arrow from the start square to the end square and drawing the stroke
  context.beginPath();
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  context.stroke();

  // Starting a new path from the head of the arrow to one of the sides of the point
  context.beginPath();
  context.moveTo(end.x, end.y);
  context.lineTo(end.x - headLength * Math.cos(angle - Math.PI / 7), end.y - headLength * Math.sin(angle - Math.PI / 7));

  // Path from the side point of the arrow, to the other side point
  context.lineTo(end.x - headLength * Math.cos(angle + Math.PI / 7), end.y - headLength * Math.sin(angle + Math.PI / 7));

  // Path from the side point back to the tip of the arrow, and then again to the opposite side point
  context.lineTo(end.x, end.y);
  context.lineTo(end.x - headLength * Math.cos(angle - Math.PI / 7), end.y - headLength * Math.sin(angle - Math.PI / 7));

  // Draws the paths created above
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  context.stroke();
  context.fillStyle = color;
  context.fill();
};

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (points) {
  var page = _externalModules2.default.cornerstoneMath.point.copy(points.page);
  var image = _externalModules2.default.cornerstoneMath.point.copy(points.image);
  var client = _externalModules2.default.cornerstoneMath.point.copy(points.client);
  var canvas = _externalModules2.default.cornerstoneMath.point.copy(points.canvas);

  return {
    page: page,
    image: image,
    client: client,
    canvas: canvas
  };
};

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (sp, ellipse) {
  // TODO: Get a real statistics library here that supports large counts

  var sum = 0;
  var sumSquared = 0;
  var count = 0;
  var index = 0;

  for (var y = ellipse.top; y < ellipse.top + ellipse.height; y++) {
    for (var x = ellipse.left; x < ellipse.left + ellipse.width; x++) {
      var point = {
        x: x,
        y: y
      };

      if ((0, _pointInEllipse2.default)(ellipse, point)) {
        sum += sp[index];
        sumSquared += sp[index] * sp[index];
        count++;
      }

      index++;
    }
  }

  if (count === 0) {
    return {
      count: count,
      mean: 0.0,
      variance: 0.0,
      stdDev: 0.0
    };
  }

  var mean = sum / count;
  var variance = sumSquared / count - mean * mean;

  return {
    count: count,
    mean: mean,
    variance: variance,
    stdDev: Math.sqrt(variance)
  };
};

var _pointInEllipse = __webpack_require__(21);

var _pointInEllipse2 = _interopRequireDefault(_pointInEllipse);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (event, data, toolData, toolType, deleteIfHandleOutsideImage, doneMovingCallback) {
  var touchEventData = event.detail;
  var element = touchEventData.element;
  var cornerstone = _externalModules2.default.cornerstone;

  function touchDragCallback(e) {
    var eventData = e.detail;

    data.active = true;

    Object.keys(data.handles).forEach(function (name) {
      var handle = data.handles[name];

      if (handle.movesIndependently === true) {
        return;
      }

      handle.x += eventData.deltaPoints.image.x;
      handle.y += eventData.deltaPoints.image.y;
    });
    cornerstone.updateImage(element);

    var eventType = _events2.default.MEASUREMENT_MODIFIED;
    var modifiedEventData = {
      toolType: toolType,
      element: element,
      measurementData: data
    };

    (0, _triggerEvent2.default)(element, eventType, modifiedEventData);

    e.preventDefault();
    e.stopPropagation();
  }

  element.addEventListener(_events2.default.TOUCH_DRAG, touchDragCallback);

  function touchEndCallback(e) {
    var eventData = e.detail;

    // Console.log('touchMoveAllHandles touchEndCallback: ' + e.type);
    data.active = false;
    data.invalidated = false;

    element.removeEventListener(_events2.default.TOUCH_DRAG, touchDragCallback);

    element.removeEventListener(_events2.default.TOUCH_PINCH, touchEndCallback);
    element.removeEventListener(_events2.default.TOUCH_PRESS, touchEndCallback);
    element.removeEventListener(_events2.default.TOUCH_END, touchEndCallback);
    element.removeEventListener(_events2.default.TOUCH_DRAG_END, touchEndCallback);
    element.removeEventListener(_events2.default.TAP, touchEndCallback);

    // If any handle is outside the image, delete the tool data
    var handlesOutsideImage = (0, _anyHandlesOutsideImage2.default)(eventData, data.handles);

    if (deleteIfHandleOutsideImage === true && handlesOutsideImage === true) {
      (0, _toolState.removeToolState)(element, toolType, data);
    }

    cornerstone.updateImage(element);

    if (typeof doneMovingCallback === 'function') {
      doneMovingCallback(e);
    }
  }

  element.addEventListener(_events2.default.TOUCH_PINCH, touchEndCallback);
  element.addEventListener(_events2.default.TOUCH_PRESS, touchEndCallback);
  element.addEventListener(_events2.default.TOUCH_END, touchEndCallback);
  element.addEventListener(_events2.default.TOUCH_DRAG_END, touchEndCallback);
  element.addEventListener(_events2.default.TAP, touchEndCallback);

  return true;
};

var _events = __webpack_require__(1);

var _events2 = _interopRequireDefault(_events);

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _anyHandlesOutsideImage = __webpack_require__(12);

var _anyHandlesOutsideImage2 = _interopRequireDefault(_anyHandlesOutsideImage);

var _toolState = __webpack_require__(2);

var _triggerEvent = __webpack_require__(3);

var _triggerEvent2 = _interopRequireDefault(_triggerEvent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (event, toolType, data, handle, doneMovingCallback) {
  // Console.log('touchMoveHandle');
  runAnimation.value = true;

  var touchEventData = event.detail;
  var cornerstone = _externalModules2.default.cornerstone;
  var element = touchEventData.element;
  var enabledElement = cornerstone.getEnabledElement(element);

  var time = new Date().getTime();

  // Average pixel width of index finger is 45-57 pixels
  // https://www.smashingmagazine.com/2012/02/finger-friendly-design-ideal-mobile-touchscreen-target-sizes/
  var fingerDistance = -57;

  var aboveFinger = {
    x: touchEventData.currentPoints.page.x,
    y: touchEventData.currentPoints.page.y + fingerDistance
  };

  var targetLocation = cornerstone.pageToPixel(element, aboveFinger.x, aboveFinger.y);

  function touchDragCallback(e) {
    var eventData = e.detail;

    // Console.log('touchMoveHandle touchDragCallback: ' + e.type);
    runAnimation.value = false;

    if (handle.hasMoved === false) {
      handle.hasMoved = true;
    }

    handle.active = true;

    var currentPoints = eventData.currentPoints;
    var aboveFinger = {
      x: currentPoints.page.x,
      y: currentPoints.page.y + fingerDistance
    };

    targetLocation = cornerstone.pageToPixel(element, aboveFinger.x, aboveFinger.y);
    handle.x = targetLocation.x;
    handle.y = targetLocation.y;

    cornerstone.updateImage(element);

    var eventType = _events2.default.MEASUREMENT_MODIFIED;
    var modifiedEventData = {
      toolType: toolType,
      element: element,
      measurementData: data
    };

    (0, _triggerEvent2.default)(element, eventType, modifiedEventData);
  }

  element.addEventListener(_events2.default.TOUCH_DRAG, touchDragCallback);

  function touchEndCallback(e) {
    var eventData = e.detail;
    // Console.log('touchMoveHandle touchEndCallback: ' + e.type);

    runAnimation.value = false;

    handle.active = false;
    element.removeEventListener(_events2.default.TOUCH_DRAG, touchDragCallback);
    touchEndEvents.forEach(function (eventType) {
      element.removeEventListener(eventType, touchEndCallback);
    });

    cornerstone.updateImage(element);

    if (e.type === _events2.default.TOUCH_PRESS) {
      eventData.handlePressed = data;

      handle.x = touchEventData.currentPoints.image.x;
      handle.y = touchEventData.currentPoints.image.y;
    }

    if (typeof doneMovingCallback === 'function') {
      doneMovingCallback(e);
    }
  }

  touchEndEvents.forEach(function (eventType) {
    element.addEventListener(eventType, touchEndCallback);
  });

  animate(time, handle, runAnimation, enabledElement, targetLocation);
};

var _events = __webpack_require__(1);

var _events2 = _interopRequireDefault(_events);

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _triggerEvent = __webpack_require__(3);

var _triggerEvent2 = _interopRequireDefault(_triggerEvent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Define the runAnimation boolean as an object
 * so that it can be modified by reference
 */
var runAnimation = {
  value: false
};

var touchEndEvents = [_events2.default.TOUCH_END, _events2.default.TOUCH_DRAG_END, _events2.default.TOUCH_PINCH, _events2.default.TOUCH_PRESS, _events2.default.TAP];

function animate(lastTime, handle, runAnimation, enabledElement, targetLocation) {
  // See http://www.html5canvastutorials.com/advanced/html5-canvas-start-and-stop-an-animation/
  if (!runAnimation.value) {
    return;
  }

  var cornerstone = _externalModules2.default.cornerstone;
  // Update
  var time = new Date().getTime();
  // Var timeDiff = time - lastTime;

  // Pixels / second
  var distanceRemaining = Math.abs(handle.y - targetLocation.y);
  var linearDistEachFrame = distanceRemaining / 10;

  if (distanceRemaining < 1) {
    handle.y = targetLocation.y;
    runAnimation.value = false;

    return;
  }

  if (handle.y > targetLocation.y) {
    handle.y -= linearDistEachFrame;
  } else if (handle.y < targetLocation.y) {
    handle.y += linearDistEachFrame;
  }

  // Update the image
  cornerstone.updateImage(enabledElement.element);

  // Request a new frame
  cornerstone.requestAnimationFrame(function () {
    animate(time, handle, runAnimation, enabledElement, targetLocation);
  });
}

/***/ }),
/* 45 */,
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (targetImagePlane, referenceImagePlane) {
  var points = (0, _pointProjector.planePlaneIntersection)(targetImagePlane, referenceImagePlane);

  if (!points) {
    return;
  }

  return {
    start: (0, _pointProjector.projectPatientPointToImagePlane)(points.start, targetImagePlane),
    end: (0, _pointProjector.projectPatientPointToImagePlane)(points.end, targetImagePlane)
  };
};

var _pointProjector = __webpack_require__(25);

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (context, eventData, targetElement, referenceElement) {
  var cornerstone = _externalModules2.default.cornerstone;
  var targetImage = cornerstone.getEnabledElement(targetElement).image;
  var referenceImage = cornerstone.getEnabledElement(referenceElement).image;

  // Make sure the images are actually loaded for the target and reference
  if (!targetImage || !referenceImage) {
    return;
  }

  var targetImagePlane = cornerstone.metaData.get('imagePlaneModule', targetImage.imageId);
  var referenceImagePlane = cornerstone.metaData.get('imagePlaneModule', referenceImage.imageId);

  // Make sure the target and reference actually have image plane metadata
  if (!targetImagePlane || !referenceImagePlane || !targetImagePlane.rowCosines || !targetImagePlane.columnCosines || !targetImagePlane.imagePositionPatient || !referenceImagePlane.rowCosines || !referenceImagePlane.columnCosines || !referenceImagePlane.imagePositionPatient) {
    return;
  }

  // The image planes must be in the same frame of reference
  if (targetImagePlane.frameOfReferenceUID !== referenceImagePlane.frameOfReferenceUID) {
    return;
  }

  targetImagePlane.rowCosines = (0, _convertToVector2.default)(targetImagePlane.rowCosines);
  targetImagePlane.columnCosines = (0, _convertToVector2.default)(targetImagePlane.columnCosines);
  targetImagePlane.imagePositionPatient = (0, _convertToVector2.default)(targetImagePlane.imagePositionPatient);
  referenceImagePlane.rowCosines = (0, _convertToVector2.default)(referenceImagePlane.rowCosines);
  referenceImagePlane.columnCosines = (0, _convertToVector2.default)(referenceImagePlane.columnCosines);
  referenceImagePlane.imagePositionPatient = (0, _convertToVector2.default)(referenceImagePlane.imagePositionPatient);

  // The image plane normals must be > 30 degrees apart
  var targetNormal = targetImagePlane.rowCosines.clone().cross(targetImagePlane.columnCosines);
  var referenceNormal = referenceImagePlane.rowCosines.clone().cross(referenceImagePlane.columnCosines);
  var angleInRadians = targetNormal.angleTo(referenceNormal);

  angleInRadians = Math.abs(angleInRadians);
  if (angleInRadians < 0.5) {
    // 0.5 radians = ~30 degrees
    return;
  }

  var referenceLine = (0, _calculateReferenceLine2.default)(targetImagePlane, referenceImagePlane);

  if (!referenceLine) {
    return;
  }

  var refLineStartCanvas = cornerstone.pixelToCanvas(eventData.element, referenceLine.start);
  var refLineEndCanvas = cornerstone.pixelToCanvas(eventData.element, referenceLine.end);

  var color = _toolColors2.default.getActiveColor();
  var lineWidth = _toolStyle2.default.getToolWidth();

  // Draw the referenceLines
  context.setTransform(1, 0, 0, 1, 0, 0);

  context.save();
  context.beginPath();
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  context.moveTo(refLineStartCanvas.x, refLineStartCanvas.y);
  context.lineTo(refLineEndCanvas.x, refLineEndCanvas.y);
  context.stroke();
  context.restore();
};

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _calculateReferenceLine = __webpack_require__(46);

var _calculateReferenceLine2 = _interopRequireDefault(_calculateReferenceLine);

var _toolColors = __webpack_require__(7);

var _toolColors2 = _interopRequireDefault(_toolColors);

var _toolStyle = __webpack_require__(8);

var _toolStyle2 = _interopRequireDefault(_toolStyle);

var _convertToVector = __webpack_require__(14);

var _convertToVector2 = _interopRequireDefault(_convertToVector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
// Functions to prevent ghost clicks following a touch
// All credit to @kosich
// https://gist.github.com/kosich/23188dd86633b6c2efb7

var antiGhostDelay = 2000,
    pointerType = {
  mouse: 0,
  touch: 1
};

var lastInteractionType = void 0,
    lastInteractionTime = void 0;

function handleTap(type, e) {
  var now = Date.now();

  if (type !== lastInteractionType) {
    if (now - lastInteractionTime <= antiGhostDelay) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      return false;
    }

    lastInteractionType = type;
  }

  lastInteractionTime = now;
}

// Cacheing the function references
// Necessary because a new function reference is created after .bind() is called
// http://stackoverflow.com/questions/11565471/removing-event-listener-which-was-added-with-bind
var handleTapMouse = handleTap.bind(null, pointerType.mouse);
var handleTapTouch = handleTap.bind(null, pointerType.touch);

function attachEvents(element, eventList, interactionType) {
  var tapHandler = interactionType ? handleTapMouse : handleTapTouch;

  eventList.forEach(function (eventName) {
    element.addEventListener(eventName, tapHandler);
  });
}

function removeEvents(element, eventList, interactionType) {
  var tapHandler = interactionType ? handleTapMouse : handleTapTouch;

  eventList.forEach(function (eventName) {
    element.removeEventListener(eventName, tapHandler);
  });
}

var mouseEvents = ['mousedown', 'mouseup'];
var touchEvents = ['touchstart', 'touchend'];

function disable(element) {
  removeEvents(element, mouseEvents, pointerType.mouse);
  removeEvents(element, touchEvents, pointerType.touch);
}

function enable(element) {
  disable(element);
  attachEvents(element, mouseEvents, pointerType.mouse);
  attachEvents(element, touchEvents, pointerType.touch);
}

var preventGhostClick = {
  enable: enable,
  disable: disable
};

exports.default = preventGhostClick;

/***/ }),
/* 49 */,
/* 50 */,
/* 51 */,
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _events = __webpack_require__(1);

var _events2 = _interopRequireDefault(_events);

var _saveAs = __webpack_require__(53);

var _saveAs2 = _interopRequireDefault(_saveAs);

var _toolOptions = __webpack_require__(4);

var _version = __webpack_require__(54);

var _version2 = _interopRequireDefault(_version);

var _index = __webpack_require__(55);

var _index2 = _interopRequireDefault(_index);

var _index3 = __webpack_require__(34);

var _index4 = _interopRequireDefault(_index3);

var _requestPoolManager = __webpack_require__(20);

var _requestPoolManager2 = _interopRequireDefault(_requestPoolManager);

var _setContextToDisplayFontSize = __webpack_require__(57);

var _setContextToDisplayFontSize2 = _interopRequireDefault(_setContextToDisplayFontSize);

var _scrollToIndex = __webpack_require__(26);

var _scrollToIndex2 = _interopRequireDefault(_scrollToIndex);

var _scroll = __webpack_require__(27);

var _scroll2 = _interopRequireDefault(_scroll);

var _roundToDecimal = __webpack_require__(28);

var _roundToDecimal2 = _interopRequireDefault(_roundToDecimal);

var _pointProjector = __webpack_require__(25);

var _pointInsideBoundingBox = __webpack_require__(16);

var _pointInsideBoundingBox2 = _interopRequireDefault(_pointInsideBoundingBox);

var _pointInEllipse = __webpack_require__(21);

var _pointInEllipse2 = _interopRequireDefault(_pointInEllipse);

var _makeUnselectable = __webpack_require__(58);

var _makeUnselectable2 = _interopRequireDefault(_makeUnselectable);

var _isMouseButtonEnabled = __webpack_require__(6);

var _isMouseButtonEnabled2 = _interopRequireDefault(_isMouseButtonEnabled);

var _getRGBPixels = __webpack_require__(29);

var _getRGBPixels2 = _interopRequireDefault(_getRGBPixels);

var _getMaxSimultaneousRequests = __webpack_require__(18);

var _getLuminance = __webpack_require__(37);

var _getLuminance2 = _interopRequireDefault(_getLuminance);

var _drawTextBox = __webpack_require__(9);

var _drawTextBox2 = _interopRequireDefault(_drawTextBox);

var _drawEllipse = __webpack_require__(38);

var _drawEllipse2 = _interopRequireDefault(_drawEllipse);

var _drawCircle = __webpack_require__(39);

var _drawCircle2 = _interopRequireDefault(_drawCircle);

var _drawArrow = __webpack_require__(40);

var _drawArrow2 = _interopRequireDefault(_drawArrow);

var _copyPoints = __webpack_require__(41);

var _copyPoints2 = _interopRequireDefault(_copyPoints);

var _calculateSUV = __webpack_require__(19);

var _calculateSUV2 = _interopRequireDefault(_calculateSUV);

var _calculateEllipseStatistics = __webpack_require__(42);

var _calculateEllipseStatistics2 = _interopRequireDefault(_calculateEllipseStatistics);

var _wwwcSynchronizer = __webpack_require__(59);

var _wwwcSynchronizer2 = _interopRequireDefault(_wwwcSynchronizer);

var _updateImageSynchronizer = __webpack_require__(60);

var _updateImageSynchronizer2 = _interopRequireDefault(_updateImageSynchronizer);

var _Synchronizer = __webpack_require__(61);

var _Synchronizer2 = _interopRequireDefault(_Synchronizer);

var _stackScrollSynchronizer = __webpack_require__(62);

var _stackScrollSynchronizer2 = _interopRequireDefault(_stackScrollSynchronizer);

var _stackImagePositionSynchronizer = __webpack_require__(63);

var _stackImagePositionSynchronizer2 = _interopRequireDefault(_stackImagePositionSynchronizer);

var _stackImagePositionOffsetSynchronizer = __webpack_require__(64);

var _stackImagePositionOffsetSynchronizer2 = _interopRequireDefault(_stackImagePositionOffsetSynchronizer);

var _stackImageIndexSynchronizer = __webpack_require__(65);

var _stackImageIndexSynchronizer2 = _interopRequireDefault(_stackImageIndexSynchronizer);

var _panZoomSynchronizer = __webpack_require__(66);

var _panZoomSynchronizer2 = _interopRequireDefault(_panZoomSynchronizer);

var _toolStyle = __webpack_require__(8);

var _toolStyle2 = _interopRequireDefault(_toolStyle);

var _toolState = __webpack_require__(2);

var _toolCoordinates = __webpack_require__(30);

var _toolCoordinates2 = _interopRequireDefault(_toolCoordinates);

var _toolColors = __webpack_require__(7);

var _toolColors2 = _interopRequireDefault(_toolColors);

var _timeSeriesSpecificStateManager = __webpack_require__(67);

var _textStyle = __webpack_require__(13);

var _textStyle2 = _interopRequireDefault(_textStyle);

var _stackSpecificStateManager = __webpack_require__(68);

var _loadHandlerManager = __webpack_require__(11);

var _loadHandlerManager2 = _interopRequireDefault(_loadHandlerManager);

var _imageIdSpecificStateManager = __webpack_require__(15);

var _frameOfReferenceStateManager = __webpack_require__(69);

var _appState = __webpack_require__(70);

var _appState2 = _interopRequireDefault(_appState);

var _anyHandlesOutsideImage = __webpack_require__(12);

var _anyHandlesOutsideImage2 = _interopRequireDefault(_anyHandlesOutsideImage);

var _drawHandles = __webpack_require__(10);

var _drawHandles2 = _interopRequireDefault(_drawHandles);

var _getHandleNearImagePoint = __webpack_require__(17);

var _getHandleNearImagePoint2 = _interopRequireDefault(_getHandleNearImagePoint);

var _handleActivator = __webpack_require__(31);

var _handleActivator2 = _interopRequireDefault(_handleActivator);

var _moveAllHandles = __webpack_require__(32);

var _moveAllHandles2 = _interopRequireDefault(_moveAllHandles);

var _moveHandle = __webpack_require__(22);

var _moveHandle2 = _interopRequireDefault(_moveHandle);

var _moveNewHandle = __webpack_require__(23);

var _moveNewHandle2 = _interopRequireDefault(_moveNewHandle);

var _moveNewHandleTouch = __webpack_require__(24);

var _moveNewHandleTouch2 = _interopRequireDefault(_moveNewHandleTouch);

var _touchMoveAllHandles = __webpack_require__(43);

var _touchMoveAllHandles2 = _interopRequireDefault(_touchMoveAllHandles);

var _touchMoveHandle = __webpack_require__(44);

var _touchMoveHandle2 = _interopRequireDefault(_touchMoveHandle);

var _keyboardInput = __webpack_require__(71);

var _keyboardInput2 = _interopRequireDefault(_keyboardInput);

var _mouseInput = __webpack_require__(72);

var _mouseInput2 = _interopRequireDefault(_mouseInput);

var _mouseWheelInput = __webpack_require__(73);

var _mouseWheelInput2 = _interopRequireDefault(_mouseWheelInput);

var _preventGhostClick = __webpack_require__(48);

var _preventGhostClick2 = _interopRequireDefault(_preventGhostClick);

var _touchInput = __webpack_require__(74);

var _touchInput2 = _interopRequireDefault(_touchInput);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// STATE MANAGEMENT


// SYNCHRONIZER


//
// Todo: move?
exports.default = {
  external: _externalModules2.default,
  EVENTS: _events2.default,
  saveAs: _saveAs2.default,
  setToolOptions: _toolOptions.setToolOptions,
  getToolOptions: _toolOptions.getToolOptions,
  version: _version2.default,
  referenceLines: _index2.default,
  orientation: _index4.default,
  requestPoolManager: _requestPoolManager2.default,
  setContextToDisplayFontSize: _setContextToDisplayFontSize2.default,
  scrollToIndex: _scrollToIndex2.default,
  scroll: _scroll2.default,
  roundToDecimal: _roundToDecimal2.default,
  projectPatientPointToImagePlane: _pointProjector.projectPatientPointToImagePlane,
  imagePointToPatientPoint: _pointProjector.imagePointToPatientPoint,
  planePlaneIntersection: _pointProjector.planePlaneIntersection,
  pointInsideBoundingBox: _pointInsideBoundingBox2.default,
  pointInEllipse: _pointInEllipse2.default,
  makeUnselectable: _makeUnselectable2.default,
  isMouseButtonEnabled: _isMouseButtonEnabled2.default,
  getRGBPixels: _getRGBPixels2.default,
  getDefaultSimultaneousRequests: _getMaxSimultaneousRequests.getDefaultSimultaneousRequests,
  getMaxSimultaneousRequests: _getMaxSimultaneousRequests.getMaxSimultaneousRequests,
  getBrowserInfo: _getMaxSimultaneousRequests.getBrowserInfo,
  isMobileDevice: _getMaxSimultaneousRequests.isMobileDevice,
  getLuminance: _getLuminance2.default,
  drawTextBox: _drawTextBox2.default,
  drawEllipse: _drawEllipse2.default,
  drawCircle: _drawCircle2.default,
  drawArrow: _drawArrow2.default,
  copyPoints: _copyPoints2.default,
  calculateSUV: _calculateSUV2.default,
  calculateEllipseStatistics: _calculateEllipseStatistics2.default,
  // Synchronizer
  wwwcSynchronizer: _wwwcSynchronizer2.default,
  updateImageSynchronizer: _updateImageSynchronizer2.default,
  Synchronizer: _Synchronizer2.default,
  stackScrollSynchronizer: _stackScrollSynchronizer2.default,
  stackImagePositionSynchronizer: _stackImagePositionSynchronizer2.default,
  stackImagePositionOffsetSynchronizer: _stackImagePositionOffsetSynchronizer2.default,
  stackImageIndexSynchronizer: _stackImageIndexSynchronizer2.default,
  panZoomSynchronizer: _panZoomSynchronizer2.default,
  // State
  toolStyle: _toolStyle2.default,
  addToolState: _toolState.addToolState,
  getToolState: _toolState.getToolState,
  removeToolState: _toolState.removeToolState,
  clearToolState: _toolState.clearToolState,
  setElementToolStateManager: _toolState.setElementToolStateManager,
  getElementToolStateManager: _toolState.getElementToolStateManager,
  toolCoordinates: _toolCoordinates2.default,
  toolColors: _toolColors2.default,
  addTimeSeriesStateManager: _timeSeriesSpecificStateManager.addTimeSeriesStateManager,
  newTimeSeriesSpecificToolStateManager: _timeSeriesSpecificStateManager.newTimeSeriesSpecificToolStateManager,
  textStyle: _textStyle2.default,
  stackSpecificStateManager: _stackSpecificStateManager.stackSpecificStateManager,
  newStackSpecificToolStateManager: _stackSpecificStateManager.newStackSpecificToolStateManager,
  addStackStateManager: _stackSpecificStateManager.addStackStateManager,
  loadHandlerManager: _loadHandlerManager2.default,
  newImageIdSpecificToolStateManager: _imageIdSpecificStateManager.newImageIdSpecificToolStateManager,
  globalImageIdSpecificToolStateManager: _imageIdSpecificStateManager.globalImageIdSpecificToolStateManager,
  newFrameOfReferenceSpecificToolStateManager: _frameOfReferenceStateManager.newFrameOfReferenceSpecificToolStateManager,
  globalFrameOfReferenceSpecificToolStateManager: _frameOfReferenceStateManager.globalFrameOfReferenceSpecificToolStateManager,
  //
  appState: _appState2.default,
  // Manipulators
  anyHandlesOutsideImage: _anyHandlesOutsideImage2.default,
  drawHandles: _drawHandles2.default,
  getHandleNearImagePoint: _getHandleNearImagePoint2.default,
  handleActivator: _handleActivator2.default,
  moveAllHandles: _moveAllHandles2.default,
  moveHandle: _moveHandle2.default,
  moveNewHandle: _moveNewHandle2.default,
  moveNewHandleTouch: _moveNewHandleTouch2.default,
  touchMoveAllHandles: _touchMoveAllHandles2.default,
  touchMoveHandle: _touchMoveHandle2.default,
  // Input sources
  keyboardInput: _keyboardInput2.default,
  mouseInput: _mouseInput2.default,
  mouseWheelInput: _mouseWheelInput2.default,
  preventGhostClick: _preventGhostClick2.default,
  touchInput: _touchInput2.default
};

// INPUT SOURCES
// Todo: These probably don't need to be top level API members
//       Maybe a top level way to add new input sources? Or to
//       Add a tool utilizes an existing input source?


// MANIPULATORS
// Todo: These probably don't need to be top level API members
//       Should be consumed by tools/base tools

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = saveAs;
function saveAs(element, filename) {
  var mimetype = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'image/png';

  // Setting the default value for mimetype to image/png
  var canvas = element.querySelector('canvas');

  // Thanks to Ken Fyrstenber
  // http://stackoverflow.com/questions/18480474/how-to-save-an-image-from-canvas
  var lnk = document.createElement('a');

  // The key here is to set the download attribute of the a tag
  lnk.download = filename;

  // Convert canvas content to data-uri for link. When download
  // Attribute is set the content pointed to by link will be
  // Pushed as 'download' in HTML5 capable browsers
  lnk.href = canvas.toDataURL(mimetype, 1);

  // / create a 'fake' click-event to trigger the download
  if (document.createEvent) {
    var e = document.createEvent('MouseEvents');

    e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

    lnk.dispatchEvent(e);
  } else if (lnk.fireEvent) {
    lnk.fireEvent('onclick');
  }
}

/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = '2.1.0';

/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _calculateReferenceLine = __webpack_require__(46);

var _calculateReferenceLine2 = _interopRequireDefault(_calculateReferenceLine);

var _referenceLinesTool = __webpack_require__(56);

var _referenceLinesTool2 = _interopRequireDefault(_referenceLinesTool);

var _renderActiveReferenceLine = __webpack_require__(47);

var _renderActiveReferenceLine2 = _interopRequireDefault(_renderActiveReferenceLine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var referenceLines = {
  calculateReferenceLine: _calculateReferenceLine2.default,
  tool: _referenceLinesTool2.default,
  renderActiveReferenceLine: _renderActiveReferenceLine2.default
};

exports.default = referenceLines;

/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = __webpack_require__(1);

var _events2 = _interopRequireDefault(_events);

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _toolState = __webpack_require__(2);

var _renderActiveReferenceLine = __webpack_require__(47);

var _renderActiveReferenceLine2 = _interopRequireDefault(_renderActiveReferenceLine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var toolType = 'referenceLines';

function onImageRendered(e) {
  var eventData = e.detail;

  // If we have no toolData for this element, return immediately as there is nothing to do
  var toolData = (0, _toolState.getToolState)(e.currentTarget, toolType);

  if (toolData === undefined) {
    return;
  }

  // Get the enabled elements associated with this synchronization context and draw them
  var syncContext = toolData.data[0].synchronizationContext;
  var enabledElements = syncContext.getSourceElements();

  var renderer = toolData.data[0].renderer;

  // Create the canvas context and reset it to the pixel coordinate system
  var context = eventData.canvasContext.canvas.getContext('2d');

  _externalModules2.default.cornerstone.setToPixelCoordinateSystem(eventData.enabledElement, context);

  // Iterate over each referenced element
  enabledElements.forEach(function (referenceEnabledElement) {

    // Don't draw ourselves
    if (referenceEnabledElement === e.currentTarget) {
      return;
    }

    // Render it
    renderer(context, eventData, e.currentTarget, referenceEnabledElement);
  });
}

// Enables the reference line tool for a given element.  Note that a custom renderer
// Can be provided if you want different rendering (e.g. all reference lines, first/last/active, etc)
function enable(element, synchronizationContext, renderer) {
  renderer = renderer || _renderActiveReferenceLine2.default;

  (0, _toolState.addToolState)(element, toolType, {
    synchronizationContext: synchronizationContext,
    renderer: renderer
  });

  element.removeEventListener(_events2.default.IMAGE_RENDERED, onImageRendered);
  element.addEventListener(_events2.default.IMAGE_RENDERED, onImageRendered);
  _externalModules2.default.cornerstone.updateImage(element);
}

// Disables the reference line tool for the given element
function disable(element) {
  element.removeEventListener(_events2.default.IMAGE_RENDERED, onImageRendered);
  _externalModules2.default.cornerstone.updateImage(element);
}

// Module/private exports
var tool = {
  enable: enable,
  disable: disable
};

exports.default = tool;

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (enabledElement, context, fontSize) {
  var fontScale = 0.1;

  _externalModules2.default.cornerstone.setToPixelCoordinateSystem(enabledElement, context, fontScale);
  // Return the font size to use
  var scaledFontSize = fontSize / enabledElement.viewport.scale / fontScale;
  // TODO: actually calculate this?
  var lineHeight = fontSize / enabledElement.viewport.scale / fontScale;

  return {
    fontSize: scaledFontSize,
    lineHeight: lineHeight,
    fontScale: fontScale
  };
};

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (element, ignorePointerEvents) {
  element.style.webkitUserSelect = 'none';
  element.style.webkitTouchCallout = 'none';
  element.style.mozUserSelect = 'none';
  element.style.msUserSelect = 'none';
  element.style.oUserSelect = 'none';
  element.style.khtmlUserSelect = 'none';
  element.style.userSelect = 'none';

  element.unselectable = 'on';
  element.oncontextmenu = function () {
    return false;
  };

  if (ignorePointerEvents === true) {
    element.style.pointerEvents = 'none';
  }
};

/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (synchronizer, sourceElement, targetElement) {

  // Ignore the case where the source and target are the same enabled element
  if (targetElement === sourceElement) {
    return;
  }

  var cornerstone = _externalModules2.default.cornerstone;
  // Get the source and target viewports
  var sourceViewport = cornerstone.getViewport(sourceElement);
  var targetViewport = cornerstone.getViewport(targetElement);

  // Do nothing if the ww/wc already match
  if (targetViewport.voi.windowWidth === sourceViewport.voi.windowWidth && targetViewport.voi.windowCenter === sourceViewport.voi.windowCenter && targetViewport.invert === sourceViewport.invert) {
    return;
  }

  // Www/wc are different, sync them
  targetViewport.voi.windowWidth = sourceViewport.voi.windowWidth;
  targetViewport.voi.windowCenter = sourceViewport.voi.windowCenter;
  targetViewport.invert = sourceViewport.invert;
  synchronizer.setViewport(targetElement, targetViewport);
};

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (synchronizer, sourceElement, targetElement) {

  // Ignore the case where the source and target are the same enabled element
  if (targetElement === sourceElement) {
    return;
  }

  _externalModules2.default.cornerstone.updateImage(targetElement);
};

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = __webpack_require__(1);

var _events2 = _interopRequireDefault(_events);

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _convertToVector = __webpack_require__(14);

var _convertToVector2 = _interopRequireDefault(_convertToVector);

var _toolOptions = __webpack_require__(4);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function unique(array) {
  return array.filter(function (value, index, self) {
    return self.indexOf(value) === index;
  });
}

// This object is responsible for synchronizing target elements when an event fires on a source
// Element
// @param event can contain more than one event, separated by a space
function Synchronizer(event, handler) {
  var cornerstone = _externalModules2.default.cornerstone;
  var that = this;
  var sourceElements = []; // Source elements fire the events we want to synchronize to
  var targetElements = []; // Target elements we want to synchronize to source elements

  var ignoreFiredEvents = false;
  var initialData = {};
  var eventHandler = handler;

  this.setHandler = function (handler) {
    eventHandler = handler;
  };

  this.getHandler = function () {
    return eventHandler;
  };

  this.getDistances = function () {
    if (!sourceElements.length || !targetElements.length) {
      return;
    }

    initialData.distances = {};
    initialData.imageIds = {
      sourceElements: [],
      targetElements: []
    };

    sourceElements.forEach(function (sourceElement) {
      var sourceEnabledElement = cornerstone.getEnabledElement(sourceElement);

      if (!sourceEnabledElement || !sourceEnabledElement.image) {
        return;
      }

      var sourceImageId = sourceEnabledElement.image.imageId;
      var sourceImagePlane = cornerstone.metaData.get('imagePlaneModule', sourceImageId);

      if (!sourceImagePlane || !sourceImagePlane.imagePositionPatient) {
        return;
      }

      var sourceImagePosition = (0, _convertToVector2.default)(sourceImagePlane.imagePositionPatient);

      if (initialData.hasOwnProperty(sourceEnabledElement)) {
        return;
      }
      initialData.distances[sourceImageId] = {};

      initialData.imageIds.sourceElements.push(sourceImageId);

      targetElements.forEach(function (targetElement) {
        var targetEnabledElement = cornerstone.getEnabledElement(targetElement);

        if (!targetEnabledElement || !targetEnabledElement.image) {
          return;
        }

        var targetImageId = targetEnabledElement.image.imageId;

        initialData.imageIds.targetElements.push(targetImageId);

        if (sourceElement === targetElement) {
          return;
        }

        if (sourceImageId === targetImageId) {
          return;
        }

        if (initialData.distances[sourceImageId].hasOwnProperty(targetImageId)) {
          return;
        }

        var targetImagePlane = cornerstone.metaData.get('imagePlaneModule', targetImageId);

        if (!targetImagePlane || !targetImagePlane.imagePositionPatient) {
          return;
        }

        var targetImagePosition = (0, _convertToVector2.default)(targetImagePlane.imagePositionPatient);

        initialData.distances[sourceImageId][targetImageId] = targetImagePosition.clone().sub(sourceImagePosition);
      });

      if (!Object.keys(initialData.distances[sourceImageId]).length) {
        delete initialData.distances[sourceImageId];
      }
    });
  };

  function fireEvent(sourceElement, eventData) {
    // Broadcast an event that something changed
    if (!sourceElements.length || !targetElements.length) {
      return;
    }

    ignoreFiredEvents = true;
    targetElements.forEach(function (targetElement) {
      var targetIndex = targetElements.indexOf(targetElement);

      if (targetIndex === -1) {
        return;
      }

      var targetImageId = initialData.imageIds.targetElements[targetIndex];
      var sourceIndex = sourceElements.indexOf(sourceElement);

      if (sourceIndex === -1) {
        return;
      }

      var sourceImageId = initialData.imageIds.sourceElements[sourceIndex];

      var positionDifference = void 0;

      if (sourceImageId === targetImageId) {
        positionDifference = 0;
      } else if (initialData.distances[sourceImageId] !== undefined) {
        positionDifference = initialData.distances[sourceImageId][targetImageId];
      }

      eventHandler(that, sourceElement, targetElement, eventData, positionDifference);
    });
    ignoreFiredEvents = false;
  }

  function onEvent(e) {
    var eventData = e.detail;

    if (ignoreFiredEvents === true) {
      return;
    }

    fireEvent(e.currentTarget, eventData);
  }

  // Adds an element as a source
  this.addSource = function (element) {
    // Return if this element was previously added
    var index = sourceElements.indexOf(element);

    if (index !== -1) {
      return;
    }

    // Add to our list of enabled elements
    sourceElements.push(element);

    // Subscribe to the event
    event.split(' ').forEach(function (oneEvent) {
      element.addEventListener(oneEvent, onEvent);
    });

    // Update the initial distances between elements
    that.getDistances();

    that.updateDisableHandlers();
  };

  // Adds an element as a target
  this.addTarget = function (element) {
    // Return if this element was previously added
    var index = targetElements.indexOf(element);

    if (index !== -1) {
      return;
    }

    // Add to our list of enabled elements
    targetElements.push(element);

    // Update the initial distances between elements
    that.getDistances();

    // Invoke the handler for this new target element
    eventHandler(that, element, element, 0);

    that.updateDisableHandlers();
  };

  // Adds an element as both a source and a target
  this.add = function (element) {
    that.addSource(element);
    that.addTarget(element);
  };

  // Removes an element as a source
  this.removeSource = function (element) {
    // Find the index of this element
    var index = sourceElements.indexOf(element);

    if (index === -1) {
      return;
    }

    // Remove this element from the array
    sourceElements.splice(index, 1);

    // Stop listening for the event
    event.split(' ').forEach(function (oneEvent) {
      element.removeEventListener(oneEvent, onEvent);
    });

    // Update the initial distances between elements
    that.getDistances();

    // Update everyone listening for events
    fireEvent(element);
    that.updateDisableHandlers();
  };

  // Removes an element as a target
  this.removeTarget = function (element) {
    // Find the index of this element
    var index = targetElements.indexOf(element);

    if (index === -1) {
      return;
    }

    // Remove this element from the array
    targetElements.splice(index, 1);

    // Update the initial distances between elements
    that.getDistances();

    // Invoke the handler for the removed target
    eventHandler(that, element, element, 0);
    that.updateDisableHandlers();
  };

  // Removes an element as both a source and target
  this.remove = function (element) {
    that.removeTarget(element);
    that.removeSource(element);
  };

  // Returns the source elements
  this.getSourceElements = function () {
    return sourceElements;
  };

  // Returns the target elements
  this.getTargetElements = function () {
    return targetElements;
  };

  this.displayImage = function (element, image, viewport) {
    ignoreFiredEvents = true;
    cornerstone.displayImage(element, image, viewport);
    ignoreFiredEvents = false;
  };

  this.setViewport = function (element, viewport) {
    ignoreFiredEvents = true;
    cornerstone.setViewport(element, viewport);
    ignoreFiredEvents = false;
  };

  function disableHandler(e) {
    var element = e.detail.element;

    that.remove(element);
    (0, _toolOptions.clearToolOptionsByElement)(element);
  }

  this.updateDisableHandlers = function () {
    var elements = unique(sourceElements.concat(targetElements));

    elements.forEach(function (element) {
      element.removeEventListener(_events2.default.ELEMENT_DISABLED, disableHandler);
      element.addEventListener(_events2.default.ELEMENT_DISABLED, disableHandler);
    });
  };

  this.destroy = function () {
    var elements = unique(sourceElements.concat(targetElements));

    elements.forEach(function (element) {
      that.remove(element);
    });
  };
}

exports.default = Synchronizer;

/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (synchronizer, sourceElement, targetElement, eventData) {
  // If the target and source are the same, stop
  if (sourceElement === targetElement) {
    return;
  }

  // If there is no event, or direction is 0, stop
  if (!eventData || !eventData.direction) {
    return;
  }

  var cornerstone = _externalModules2.default.cornerstone;
  // Get the stack of the target viewport
  var stackToolDataSource = (0, _toolState.getToolState)(targetElement, 'stack');
  var stackData = stackToolDataSource.data[0];

  // Get the new index for the stack
  var newImageIdIndex = stackData.currentImageIdIndex + eventData.direction;

  // Ensure the index does not exceed the bounds of the stack
  newImageIdIndex = Math.min(Math.max(newImageIdIndex, 0), stackData.imageIds.length - 1);

  // If the index has not changed, stop here
  if (stackData.currentImageIdIndex === newImageIdIndex) {
    return;
  }

  var startLoadingHandler = _loadHandlerManager2.default.getStartLoadHandler();
  var endLoadingHandler = _loadHandlerManager2.default.getEndLoadHandler();
  var errorLoadingHandler = _loadHandlerManager2.default.getErrorLoadingHandler();

  if (startLoadingHandler) {
    startLoadingHandler(targetElement);
  }

  var loader = void 0;

  if (stackData.preventCache === true) {
    loader = cornerstone.loadImage(stackData.imageIds[newImageIdIndex]);
  } else {
    loader = cornerstone.loadAndCacheImage(stackData.imageIds[newImageIdIndex]);
  }

  loader.then(function (image) {
    var viewport = cornerstone.getViewport(targetElement);

    stackData.currentImageIdIndex = newImageIdIndex;
    synchronizer.displayImage(targetElement, image, viewport);
    if (endLoadingHandler) {
      endLoadingHandler(targetElement, image);
    }
  }, function (error) {
    var imageId = stackData.imageIds[newImageIdIndex];

    if (errorLoadingHandler) {
      errorLoadingHandler(targetElement, imageId, error);
    }
  });
};

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _toolState = __webpack_require__(2);

var _loadHandlerManager = __webpack_require__(11);

var _loadHandlerManager2 = _interopRequireDefault(_loadHandlerManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (synchronizer, sourceElement, targetElement) {

  // Ignore the case where the source and target are the same enabled element
  if (targetElement === sourceElement) {
    return;
  }

  var cornerstone = _externalModules2.default.cornerstone;
  var sourceImage = cornerstone.getEnabledElement(sourceElement).image;
  var sourceImagePlane = cornerstone.metaData.get('imagePlaneModule', sourceImage.imageId);

  if (sourceImagePlane === undefined || sourceImagePlane.imagePositionPatient === undefined) {
    // Console.log('No position found for image ' + sourceImage.imageId);

    return;
  }

  var sourceImagePosition = (0, _convertToVector2.default)(sourceImagePlane.imagePositionPatient);
  var stackToolDataSource = (0, _toolState.getToolState)(targetElement, 'stack');
  var stackData = stackToolDataSource.data[0];

  var minDistance = Number.MAX_VALUE;
  var newImageIdIndex = -1;

  stackData.imageIds.forEach(function (imageId, index) {
    var imagePlane = cornerstone.metaData.get('imagePlaneModule', imageId);

    if (imagePlane === undefined || imagePlane.imagePositionPatient === undefined) {
      // Console.log('No position found for image ' + imageId);

      return;
    }

    var imagePosition = (0, _convertToVector2.default)(imagePlane.imagePositionPatient);
    var distance = imagePosition.distanceToSquared(sourceImagePosition);
    // Console.log(index + '=' + distance);

    if (distance < minDistance) {
      minDistance = distance;
      newImageIdIndex = index;
    }
  });

  if (newImageIdIndex === stackData.currentImageIdIndex) {
    return;
  }

  var startLoadingHandler = _loadHandlerManager2.default.getStartLoadHandler();
  var endLoadingHandler = _loadHandlerManager2.default.getEndLoadHandler();
  var errorLoadingHandler = _loadHandlerManager2.default.getErrorLoadingHandler();

  if (startLoadingHandler) {
    startLoadingHandler(targetElement);
  }

  if (newImageIdIndex !== -1) {
    var loader = void 0;

    if (stackData.preventCache === true) {
      loader = cornerstone.loadImage(stackData.imageIds[newImageIdIndex]);
    } else {
      loader = cornerstone.loadAndCacheImage(stackData.imageIds[newImageIdIndex]);
    }

    loader.then(function (image) {
      var viewport = cornerstone.getViewport(targetElement);

      stackData.currentImageIdIndex = newImageIdIndex;
      synchronizer.displayImage(targetElement, image, viewport);
      if (endLoadingHandler) {
        endLoadingHandler(targetElement, image);
      }
    }, function (error) {
      var imageId = stackData.imageIds[newImageIdIndex];

      if (errorLoadingHandler) {
        errorLoadingHandler(targetElement, imageId, error);
      }
    });
  }
};

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _toolState = __webpack_require__(2);

var _loadHandlerManager = __webpack_require__(11);

var _loadHandlerManager2 = _interopRequireDefault(_loadHandlerManager);

var _convertToVector = __webpack_require__(14);

var _convertToVector2 = _interopRequireDefault(_convertToVector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (synchronizer, sourceElement, targetElement, eventData, positionDifference) {

  // Ignore the case where the source and target are the same enabled element
  if (targetElement === sourceElement) {
    return;
  }

  var cornerstone = _externalModules2.default.cornerstone;
  var sourceEnabledElement = cornerstone.getEnabledElement(sourceElement);
  var sourceImagePlane = cornerstone.metaData.get('imagePlaneModule', sourceEnabledElement.image.imageId);
  var sourceImagePosition = (0, _convertToVector2.default)(sourceImagePlane.imagePositionPatient);

  var stackToolDataSource = (0, _toolState.getToolState)(targetElement, 'stack');
  var stackData = stackToolDataSource.data[0];

  var minDistance = Number.MAX_VALUE;
  var newImageIdIndex = -1;

  if (!positionDifference) {
    return;
  }

  var finalPosition = sourceImagePosition.clone().add(positionDifference);

  stackData.imageIds.forEach(function (imageId, index) {
    var imagePlane = cornerstone.metaData.get('imagePlaneModule', imageId);
    var imagePosition = (0, _convertToVector2.default)(imagePlane.imagePositionPatient);
    var distance = finalPosition.distanceToSquared(imagePosition);

    if (distance < minDistance) {
      minDistance = distance;
      newImageIdIndex = index;
    }
  });

  if (newImageIdIndex === stackData.currentImageIdIndex || newImageIdIndex === -1) {
    return;
  }

  var startLoadingHandler = _loadHandlerManager2.default.getStartLoadHandler();
  var endLoadingHandler = _loadHandlerManager2.default.getEndLoadHandler();
  var errorLoadingHandler = _loadHandlerManager2.default.getErrorLoadingHandler();

  if (startLoadingHandler) {
    startLoadingHandler(targetElement);
  }

  var loader = void 0;

  if (stackData.preventCache === true) {
    loader = cornerstone.loadImage(stackData.imageIds[newImageIdIndex]);
  } else {
    loader = cornerstone.loadAndCacheImage(stackData.imageIds[newImageIdIndex]);
  }

  loader.then(function (image) {
    var viewport = cornerstone.getViewport(targetElement);

    stackData.currentImageIdIndex = newImageIdIndex;
    synchronizer.displayImage(targetElement, image, viewport);
    if (endLoadingHandler) {
      endLoadingHandler(targetElement, image);
    }
  }, function (error) {
    var imageId = stackData.imageIds[newImageIdIndex];

    if (errorLoadingHandler) {
      errorLoadingHandler(targetElement, imageId, error);
    }
  });
};

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _toolState = __webpack_require__(2);

var _loadHandlerManager = __webpack_require__(11);

var _loadHandlerManager2 = _interopRequireDefault(_loadHandlerManager);

var _convertToVector = __webpack_require__(14);

var _convertToVector2 = _interopRequireDefault(_convertToVector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (synchronizer, sourceElement, targetElement) {

  // Ignore the case where the source and target are the same enabled element
  if (targetElement === sourceElement) {
    return;
  }

  var cornerstone = _externalModules2.default.cornerstone;
  var sourceStackToolDataSource = (0, _toolState.getToolState)(sourceElement, 'stack');
  var sourceStackData = sourceStackToolDataSource.data[0];
  var targetStackToolDataSource = (0, _toolState.getToolState)(targetElement, 'stack');
  var targetStackData = targetStackToolDataSource.data[0];

  var newImageIdIndex = sourceStackData.currentImageIdIndex;

  // Clamp the index
  newImageIdIndex = Math.min(Math.max(newImageIdIndex, 0), targetStackData.imageIds.length - 1);

  // Do nothing if the index has not changed
  if (newImageIdIndex === targetStackData.currentImageIdIndex) {
    return;
  }

  var startLoadingHandler = _loadHandlerManager2.default.getStartLoadHandler();
  var endLoadingHandler = _loadHandlerManager2.default.getEndLoadHandler();
  var errorLoadingHandler = _loadHandlerManager2.default.getErrorLoadingHandler();

  if (startLoadingHandler) {
    startLoadingHandler(targetElement);
  }

  var loader = void 0;

  if (targetStackData.preventCache === true) {
    loader = cornerstone.loadImage(targetStackData.imageIds[newImageIdIndex]);
  } else {
    loader = cornerstone.loadAndCacheImage(targetStackData.imageIds[newImageIdIndex]);
  }

  loader.then(function (image) {
    var viewport = cornerstone.getViewport(targetElement);

    targetStackData.currentImageIdIndex = newImageIdIndex;
    synchronizer.displayImage(targetElement, image, viewport);
    if (endLoadingHandler) {
      endLoadingHandler(targetElement, image);
    }
  }, function (error) {
    var imageId = targetStackData.imageIds[newImageIdIndex];

    if (errorLoadingHandler) {
      errorLoadingHandler(targetElement, imageId, error);
    }
  });
};

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _toolState = __webpack_require__(2);

var _loadHandlerManager = __webpack_require__(11);

var _loadHandlerManager2 = _interopRequireDefault(_loadHandlerManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (synchronizer, sourceElement, targetElement) {

  // Ignore the case where the source and target are the same enabled element
  if (targetElement === sourceElement) {
    return;
  }

  var cornerstone = _externalModules2.default.cornerstone;
  // Get the source and target viewports
  var sourceViewport = cornerstone.getViewport(sourceElement);
  var targetViewport = cornerstone.getViewport(targetElement);

  // Do nothing if the scale and translation are the same
  if (targetViewport.scale === sourceViewport.scale && targetViewport.translation.x === sourceViewport.translation.x && targetViewport.translation.y === sourceViewport.translation.y) {
    return;
  }

  // Scale and/or translation are different, sync them
  targetViewport.scale = sourceViewport.scale;
  targetViewport.translation.x = sourceViewport.translation.x;
  targetViewport.translation.y = sourceViewport.translation.y;
  synchronizer.setViewport(targetElement, targetViewport);
};

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.newTimeSeriesSpecificToolStateManager = exports.addTimeSeriesStateManager = undefined;

var _imageIdSpecificStateManager = __webpack_require__(15);

var _toolState = __webpack_require__(2);

// This implements an Stack specific tool state management strategy.  This means
// That tool data is shared between all imageIds in a given stack
function newTimeSeriesSpecificToolStateManager(toolTypes, oldStateManager) {
  var toolState = {};

  // Here we add tool state, this is done by tools as well
  // As modules that restore saved state
  function addStackSpecificToolState(element, toolType, data) {
    // If this is a tool type to apply to the stack, do so
    if (toolTypes.indexOf(toolType) >= 0) {

      // If we don't have tool state for this type of tool, add an empty object
      if (toolState.hasOwnProperty(toolType) === false) {
        toolState[toolType] = {
          data: []
        };
      }

      var toolData = toolState[toolType];

      // Finally, add this new tool to the state
      toolData.data.push(data);
    } else {
      // Call the imageId specific tool state manager
      return oldStateManager.add(element, toolType, data);
    }
  }

  // Here you can get state - used by tools as well as modules
  // That save state persistently
  function getStackSpecificToolState(element, toolType) {
    // If this is a tool type to apply to the stack, do so
    if (toolTypes.indexOf(toolType) >= 0) {
      // If we don't have tool state for this type of tool, add an empty object
      if (toolState.hasOwnProperty(toolType) === false) {
        toolState[toolType] = {
          data: []
        };
      }

      return toolState[toolType];
    }

    // Call the imageId specific tool state manager
    return oldStateManager.get(element, toolType);
  }

  var imageIdToolStateManager = {
    get: getStackSpecificToolState,
    add: addStackSpecificToolState
  };

  return imageIdToolStateManager;
}

var timeSeriesStateManagers = [];

function addTimeSeriesStateManager(element, tools) {
  tools = tools || ['timeSeries'];
  var oldStateManager = (0, _toolState.getElementToolStateManager)(element);

  if (oldStateManager === undefined) {
    oldStateManager = _imageIdSpecificStateManager.globalImageIdSpecificToolStateManager;
  }

  var timeSeriesSpecificStateManager = newTimeSeriesSpecificToolStateManager(tools, oldStateManager);

  timeSeriesStateManagers.push(timeSeriesSpecificStateManager);
  (0, _toolState.setElementToolStateManager)(element, timeSeriesSpecificStateManager);
}

exports.addTimeSeriesStateManager = addTimeSeriesStateManager;
exports.newTimeSeriesSpecificToolStateManager = newTimeSeriesSpecificToolStateManager;

/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addStackStateManager = exports.newStackSpecificToolStateManager = exports.stackSpecificStateManager = undefined;

var _imageIdSpecificStateManager = __webpack_require__(15);

var _toolState = __webpack_require__(2);

// This implements an Stack specific tool state management strategy.  This means
// That tool data is shared between all imageIds in a given stack
function newStackSpecificToolStateManager(toolTypes, oldStateManager) {
  var toolState = {};

  function saveToolState() {
    return toolState;
  }

  function restoreToolState(stackToolState) {
    toolState = stackToolState;
  }

  // Here we add tool state, this is done by tools as well
  // As modules that restore saved state
  function addStackSpecificToolState(element, toolType, data) {
    // If this is a tool type to apply to the stack, do so
    if (toolTypes.indexOf(toolType) >= 0) {

      // If we don't have tool state for this type of tool, add an empty object
      if (toolState.hasOwnProperty(toolType) === false) {
        toolState[toolType] = {
          data: []
        };
      }

      var toolData = toolState[toolType];

      // Finally, add this new tool to the state
      toolData.data.push(data);
    } else {
      // Call the imageId specific tool state manager
      return oldStateManager.add(element, toolType, data);
    }
  }

  // Here you can get state - used by tools as well as modules
  // That save state persistently
  function getStackSpecificToolState(element, toolType) {
    // If this is a tool type to apply to the stack, do so
    if (toolTypes.indexOf(toolType) >= 0) {
      // If we don't have tool state for this type of tool, add an empty object
      if (toolState.hasOwnProperty(toolType) === false) {
        toolState[toolType] = {
          data: []
        };
      }

      return toolState[toolType];
    }

    // Call the imageId specific tool state manager
    return oldStateManager.get(element, toolType);
  }

  var stackSpecificToolStateManager = {
    get: getStackSpecificToolState,
    add: addStackSpecificToolState,
    saveToolState: saveToolState,
    restoreToolState: restoreToolState,
    toolState: toolState
  };

  return stackSpecificToolStateManager;
}

var stackStateManagers = [];

function addStackStateManager(element, otherTools) {
  var oldStateManager = (0, _toolState.getElementToolStateManager)(element);

  if (!oldStateManager) {
    oldStateManager = _imageIdSpecificStateManager.globalImageIdSpecificToolStateManager;
  }

  var stackTools = ['stack', 'stackPrefetch', 'playClip', 'volume', 'slab', 'referenceLines', 'crosshairs', 'stackRenderer'];

  if (otherTools) {
    stackTools = stackTools.concat(otherTools);
  }

  var stackSpecificStateManager = newStackSpecificToolStateManager(stackTools, oldStateManager);

  stackStateManagers.push(stackSpecificStateManager);
  (0, _toolState.setElementToolStateManager)(element, stackSpecificStateManager);
}

var stackSpecificStateManager = {
  newStackSpecificToolStateManager: newStackSpecificToolStateManager,
  addStackStateManager: addStackStateManager
};

exports.stackSpecificStateManager = stackSpecificStateManager;
exports.newStackSpecificToolStateManager = newStackSpecificToolStateManager;
exports.addStackStateManager = addStackStateManager;

/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
// This implements a frame-of-reference specific tool state management strategy.  This means that
// Measurement data are tied to a specific frame of reference UID and only visible to objects using
// That frame-of-reference UID

function newFrameOfReferenceSpecificToolStateManager() {
  var toolState = {};

  // Here we add tool state, this is done by tools as well
  // As modules that restore saved state
  function addFrameOfReferenceSpecificToolState(frameOfReference, toolType, data) {
    // If we don't have any tool state for this frameOfReference, add an empty object
    if (toolState.hasOwnProperty(frameOfReference) === false) {
      toolState[frameOfReference] = {};
    }

    var frameOfReferenceToolState = toolState[frameOfReference];

    // If we don't have tool state for this type of tool, add an empty object
    if (frameOfReferenceToolState.hasOwnProperty(toolType) === false) {
      frameOfReferenceToolState[toolType] = {
        data: []
      };
    }

    var toolData = frameOfReferenceToolState[toolType];

    // Finally, add this new tool to the state
    toolData.data.push(data);
  }

  // Here you can get state - used by tools as well as modules
  // That save state persistently
  function getFrameOfReferenceSpecificToolState(frameOfReference, toolType) {
    // If we don't have any tool state for this frame of reference, return undefined
    if (toolState.hasOwnProperty(frameOfReference) === false) {
      return;
    }

    var frameOfReferenceToolState = toolState[frameOfReference];

    // If we don't have tool state for this type of tool, return undefined
    if (frameOfReferenceToolState.hasOwnProperty(toolType) === false) {
      return;
    }

    var toolData = frameOfReferenceToolState[toolType];

    return toolData;
  }

  function removeFrameOfReferenceSpecificToolState(frameOfReference, toolType, data) {
    // If we don't have any tool state for this frame of reference, return undefined
    if (toolState.hasOwnProperty(frameOfReference) === false) {
      return;
    }

    var frameOfReferenceToolState = toolState[frameOfReference];

    // If we don't have tool state for this type of tool, return undefined
    if (frameOfReferenceToolState.hasOwnProperty(toolType) === false) {
      return;
    }

    var toolData = frameOfReferenceToolState[toolType];
    // Find this tool data
    var indexOfData = -1;

    for (var i = 0; i < toolData.data.length; i++) {
      if (toolData.data[i] === data) {
        indexOfData = i;
      }
    }

    if (indexOfData !== -1) {
      toolData.data.splice(indexOfData, 1);
    }
  }

  return {
    get: getFrameOfReferenceSpecificToolState,
    add: addFrameOfReferenceSpecificToolState,
    remove: removeFrameOfReferenceSpecificToolState
  };
}

// A global frameOfReferenceSpecificToolStateManager - the most common case is to share 3d information
// Between stacks of images
var globalFrameOfReferenceSpecificToolStateManager = newFrameOfReferenceSpecificToolStateManager();

exports.newFrameOfReferenceSpecificToolStateManager = newFrameOfReferenceSpecificToolStateManager;
exports.globalFrameOfReferenceSpecificToolStateManager = globalFrameOfReferenceSpecificToolStateManager;

/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _imageIdSpecificStateManager = __webpack_require__(15);

var _toolState = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function saveApplicationState(elements) {
  // Save imageId-specific tool state data
  var appState = {
    imageIdToolState: _imageIdSpecificStateManager.globalImageIdSpecificToolStateManager.saveToolState(),
    elementToolState: {},
    elementViewport: {}
  };

  // For each of the given elements, save the viewport and any stack-specific tool data
  elements.forEach(function (element) {
    var toolStateManager = (0, _toolState.getElementToolStateManager)(element);

    if (toolStateManager === _imageIdSpecificStateManager.globalImageIdSpecificToolStateManager) {
      return;
    }

    appState.elementToolState[element.id] = toolStateManager.saveToolState();

    appState.elementViewport[element.id] = _externalModules2.default.cornerstone.getViewport(element);
  });

  return appState;
}

function restoreApplicationState(appState) {
  if (!appState.hasOwnProperty('imageIdToolState') || !appState.hasOwnProperty('elementToolState') || !appState.hasOwnProperty('elementViewport')) {
    return;
  }

  var cornerstone = _externalModules2.default.cornerstone;

  // Restore all the imageId specific tool data
  _imageIdSpecificStateManager.globalImageIdSpecificToolStateManager.restoreToolState(appState.imageIdToolState);

  Object.keys(appState.elementViewport).forEach(function (elementId) {
    // Restore any stack specific tool data
    var element = document.getElementById(elementId);

    if (!element) {
      return;
    }

    if (!appState.elementToolState.hasOwnProperty(elementId)) {
      return;
    }

    var toolStateManager = (0, _toolState.getElementToolStateManager)(element);

    if (toolStateManager === _imageIdSpecificStateManager.globalImageIdSpecificToolStateManager) {
      return;
    }

    toolStateManager.restoreToolState(appState.elementToolState[elementId]);

    // Restore the saved viewport information
    var savedViewport = appState.elementViewport[elementId];

    cornerstone.setViewport(element, savedViewport);

    // Update the element to apply the viewport and tool changes
    cornerstone.updateImage(element);
  });

  return appState;
}

var appState = {
  save: saveApplicationState,
  restore: restoreApplicationState
};

exports.default = appState;

/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = __webpack_require__(1);

var _events2 = _interopRequireDefault(_events);

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _triggerEvent = __webpack_require__(3);

var _triggerEvent2 = _interopRequireDefault(_triggerEvent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mouseX = void 0;
var mouseY = void 0;

function keyPress(e) {
  var cornerstone = _externalModules2.default.cornerstone;
  var element = e.currentTarget;
  var enabledElement = cornerstone.getEnabledElement(element);

  if (!enabledElement.image) {
    return;
  }

  var keyPressData = {
    event: window.event || e, // Old IE support
    element: element,
    viewport: cornerstone.getViewport(element),
    image: enabledElement.image,
    currentPoints: {
      page: {
        x: mouseX,
        y: mouseY
      },
      image: cornerstone.pageToPixel(element, mouseX, mouseY)
    },
    keyCode: e.keyCode,
    which: e.which
  };

  keyPressData.currentPoints.canvas = cornerstone.pixelToCanvas(element, keyPressData.currentPoints.image);

  var keyPressEvents = {
    keydown: _events2.default.KEY_DOWN,
    keypress: _events2.default.KEY_PRESS,
    keyup: _events2.default.KEY_UP
  };

  (0, _triggerEvent2.default)(element, keyPressEvents[e.type], keyPressData);
}

function mouseMove(e) {
  mouseX = e.pageX;
  mouseY = e.pageY;
}

var keyboardEvents = ['keydown', 'keypress', 'keyup'];

function enable(element) {
  keyboardEvents.forEach(function (eventType) {
    element.removeEventListener(eventType, keyPress);
    element.addEventListener(eventType, keyPress);
  });

  element.removeEventListener('mousemove', mouseMove);
  element.addEventListener('mousemove', mouseMove);
}

function disable(element) {
  keyboardEvents.forEach(function (eventType) {
    element.removeEventListener(eventType, keyPress);
  });

  element.removeEventListener('mousemove', mouseMove);
}

// Module exports
var keyboardInput = {
  enable: enable,
  disable: disable
};

exports.default = keyboardInput;

/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = __webpack_require__(1);

var _events2 = _interopRequireDefault(_events);

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _copyPoints = __webpack_require__(41);

var _copyPoints2 = _interopRequireDefault(_copyPoints);

var _triggerEvent = __webpack_require__(3);

var _triggerEvent2 = _interopRequireDefault(_triggerEvent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isClickEvent = true;
var preventClickTimeout = void 0;
var clickDelay = 200;

function getEventWhich(event) {
  if (typeof event.buttons !== 'number') {
    return event.which;
  }

  if (event.buttons === 0) {
    return 0;
  } else if (event.buttons % 2 === 1) {
    return 1;
  } else if (event.buttons % 4 === 2) {
    return 3;
  } else if (event.buttons % 8 === 4) {
    return 2;
  }

  return 0;
}

function preventClickHandler() {
  isClickEvent = false;
}

function mouseDoubleClick(e) {
  var cornerstone = _externalModules2.default.cornerstone;
  var element = e.currentTarget;
  var enabledElement = cornerstone.getEnabledElement(element);

  if (!enabledElement.image) {
    return;
  }

  var eventType = _events2.default.MOUSE_DOUBLE_CLICK;

  var startPoints = {
    page: _externalModules2.default.cornerstoneMath.point.pageToPoint(e),
    image: cornerstone.pageToPixel(element, e.pageX, e.pageY),
    client: {
      x: e.clientX,
      y: e.clientY
    }
  };

  startPoints.canvas = cornerstone.pixelToCanvas(element, startPoints.image);

  var lastPoints = (0, _copyPoints2.default)(startPoints);

  /* Note: It seems we can't trust MouseEvent.buttons for dblclick events?
     For some reason they are always firing with e.buttons = 0
    so we have to use e.which for now instead.
     Might be related to using preventDefault on the original mousedown or click events?
  */
  var eventData = {
    event: e,
    which: e.which,
    viewport: cornerstone.getViewport(element),
    image: enabledElement.image,
    element: element,
    startPoints: startPoints,
    lastPoints: lastPoints,
    currentPoints: startPoints,
    deltaPoints: {
      x: 0,
      y: 0
    },
    type: eventType
  };

  (0, _triggerEvent2.default)(element, eventType, eventData);
}

function mouseDown(e) {
  var cornerstone = _externalModules2.default.cornerstone;
  var element = e.currentTarget;
  var enabledElement = cornerstone.getEnabledElement(element);

  if (!enabledElement.image) {
    return;
  }

  preventClickTimeout = setTimeout(preventClickHandler, clickDelay);

  var eventType = _events2.default.MOUSE_DOWN;

  // Prevent CornerstoneToolsMouseMove while mouse is down
  element.removeEventListener('mousemove', mouseMove);

  var startPoints = {
    page: _externalModules2.default.cornerstoneMath.point.pageToPoint(e),
    image: cornerstone.pageToPixel(element, e.pageX, e.pageY),
    client: {
      x: e.clientX,
      y: e.clientY
    }
  };

  startPoints.canvas = cornerstone.pixelToCanvas(element, startPoints.image);

  var lastPoints = (0, _copyPoints2.default)(startPoints);
  var eventData = {
    event: e,
    which: getEventWhich(e),
    viewport: cornerstone.getViewport(element),
    image: enabledElement.image,
    element: element,
    startPoints: startPoints,
    lastPoints: lastPoints,
    currentPoints: startPoints,
    deltaPoints: {
      x: 0,
      y: 0
    },
    type: eventType
  };

  var eventPropagated = (0, _triggerEvent2.default)(eventData.element, eventType, eventData);

  if (eventPropagated) {
    // No tools responded to this event, create a new tool
    eventData.type = _events2.default.MOUSE_DOWN_ACTIVATE;
    (0, _triggerEvent2.default)(eventData.element, _events2.default.MOUSE_DOWN_ACTIVATE, eventData);
  }

  var whichMouseButton = getEventWhich(e);

  function onMouseMove(e) {
    // Calculate our current points in page and image coordinates
    var eventType = _events2.default.MOUSE_DRAG;
    var currentPoints = {
      page: _externalModules2.default.cornerstoneMath.point.pageToPoint(e),
      image: cornerstone.pageToPixel(element, e.pageX, e.pageY),
      client: {
        x: e.clientX,
        y: e.clientY
      }
    };

    currentPoints.canvas = cornerstone.pixelToCanvas(element, currentPoints.image);

    // Calculate delta values in page and image coordinates
    var deltaPoints = {
      page: _externalModules2.default.cornerstoneMath.point.subtract(currentPoints.page, lastPoints.page),
      image: _externalModules2.default.cornerstoneMath.point.subtract(currentPoints.image, lastPoints.image),
      client: _externalModules2.default.cornerstoneMath.point.subtract(currentPoints.client, lastPoints.client),
      canvas: _externalModules2.default.cornerstoneMath.point.subtract(currentPoints.canvas, lastPoints.canvas)
    };

    var eventData = {
      which: whichMouseButton,
      viewport: cornerstone.getViewport(element),
      image: enabledElement.image,
      element: element,
      startPoints: startPoints,
      lastPoints: lastPoints,
      currentPoints: currentPoints,
      deltaPoints: deltaPoints,
      type: eventType,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      shiftKey: e.shiftKey
    };

    (0, _triggerEvent2.default)(eventData.element, eventType, eventData);

    // Update the last points
    lastPoints = (0, _copyPoints2.default)(currentPoints);
  }

  // Hook mouseup so we can unbind our event listeners
  // When they stop dragging
  function onMouseUp(e) {
    // Cancel the timeout preventing the click event from triggering
    clearTimeout(preventClickTimeout);

    var eventType = _events2.default.MOUSE_UP;

    if (isClickEvent) {
      eventType = _events2.default.MOUSE_CLICK;
    }

    // Calculate our current points in page and image coordinates
    var currentPoints = {
      page: _externalModules2.default.cornerstoneMath.point.pageToPoint(e),
      image: cornerstone.pageToPixel(element, e.pageX, e.pageY),
      client: {
        x: e.clientX,
        y: e.clientY
      }
    };

    currentPoints.canvas = cornerstone.pixelToCanvas(element, currentPoints.image);

    // Calculate delta values in page and image coordinates
    var deltaPoints = {
      page: _externalModules2.default.cornerstoneMath.point.subtract(currentPoints.page, lastPoints.page),
      image: _externalModules2.default.cornerstoneMath.point.subtract(currentPoints.image, lastPoints.image),
      client: _externalModules2.default.cornerstoneMath.point.subtract(currentPoints.client, lastPoints.client),
      canvas: _externalModules2.default.cornerstoneMath.point.subtract(currentPoints.canvas, lastPoints.canvas)
    };

    var eventData = {
      event: e,
      which: whichMouseButton,
      viewport: cornerstone.getViewport(element),
      image: enabledElement.image,
      element: element,
      startPoints: startPoints,
      lastPoints: lastPoints,
      currentPoints: currentPoints,
      deltaPoints: deltaPoints,
      type: eventType
    };

    (0, _triggerEvent2.default)(eventData.element, eventType, eventData);

    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);

    element.addEventListener('mousemove', mouseMove);

    isClickEvent = true;
  }

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

function mouseMove(e) {
  var cornerstone = _externalModules2.default.cornerstone;
  var element = e.currentTarget;
  var enabledElement = cornerstone.getEnabledElement(element);

  if (!enabledElement.image) {
    return;
  }

  var eventType = _events2.default.MOUSE_MOVE;

  var startPoints = {
    page: _externalModules2.default.cornerstoneMath.point.pageToPoint(e),
    image: cornerstone.pageToPixel(element, e.pageX, e.pageY),
    client: {
      x: e.clientX,
      y: e.clientY
    }
  };

  startPoints.canvas = cornerstone.pixelToCanvas(element, startPoints.image);

  var lastPoints = (0, _copyPoints2.default)(startPoints);

  // Calculate our current points in page and image coordinates
  var currentPoints = {
    page: _externalModules2.default.cornerstoneMath.point.pageToPoint(e),
    image: cornerstone.pageToPixel(element, e.pageX, e.pageY),
    client: {
      x: e.clientX,
      y: e.clientY
    }
  };

  currentPoints.canvas = cornerstone.pixelToCanvas(element, currentPoints.image);

  // Calculate delta values in page and image coordinates
  var deltaPoints = {
    page: _externalModules2.default.cornerstoneMath.point.subtract(currentPoints.page, lastPoints.page),
    image: _externalModules2.default.cornerstoneMath.point.subtract(currentPoints.image, lastPoints.image),
    client: _externalModules2.default.cornerstoneMath.point.subtract(currentPoints.client, lastPoints.client),
    canvas: _externalModules2.default.cornerstoneMath.point.subtract(currentPoints.canvas, lastPoints.canvas)
  };

  var eventData = {
    viewport: cornerstone.getViewport(element),
    image: enabledElement.image,
    element: element,
    startPoints: startPoints,
    lastPoints: lastPoints,
    currentPoints: currentPoints,
    deltaPoints: deltaPoints,
    type: eventType
  };

  (0, _triggerEvent2.default)(element, eventType, eventData);

  // Update the last points
  lastPoints = (0, _copyPoints2.default)(currentPoints);
}

function disable(element) {
  element.removeEventListener('mousedown', mouseDown);
  element.removeEventListener('mousemove', mouseMove);
  element.removeEventListener('dblclick', mouseDoubleClick);
}

function enable(element) {
  // Prevent handlers from being attached multiple times
  disable(element);

  element.addEventListener('mousedown', mouseDown);
  element.addEventListener('mousemove', mouseMove);
  element.addEventListener('dblclick', mouseDoubleClick);
}

// Module exports
var mouseInput = {
  enable: enable,
  disable: disable
};

exports.default = mouseInput;

/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = __webpack_require__(1);

var _events2 = _interopRequireDefault(_events);

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _triggerEvent = __webpack_require__(3);

var _triggerEvent2 = _interopRequireDefault(_triggerEvent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function mouseWheel(e) {
  var cornerstone = _externalModules2.default.cornerstone;
  var element = e.currentTarget;
  var enabledElement = cornerstone.getEnabledElement(element);

  if (!enabledElement.image) {
    return;
  }

  // !!!HACK/NOTE/WARNING!!!
  // For some reason I am getting mousewheel and DOMMouseScroll events on my
  // Mac os x mavericks system when middle mouse button dragging.
  // I couldn't find any info about this so this might break other systems
  // Webkit hack
  if (e.type === 'mousewheel' && e.wheelDeltaY === 0) {
    return;
  }
  // Firefox hack
  if (e.type === 'DOMMouseScroll' && e.axis === 1) {
    return;
  }

  e.preventDefault();

  var x = void 0;
  var y = void 0;

  if (e.pageX !== undefined && e.pageY !== undefined) {
    x = e.pageX;
    y = e.pageY;
  } else {
    // IE9 & IE10
    x = e.x;
    y = e.y;
  }

  var startingCoords = cornerstone.pageToPixel(element, x, y);

  e = window.event && window.event.wheelDelta ? window.event : e; // Old IE support

  var wheelDelta = void 0;

  if (e.wheelDelta) {
    wheelDelta = e.wheelDelta;
  } else if (e.deltaY) {
    wheelDelta = -e.deltaY;
  } else if (e.detail) {
    wheelDelta = -e.detail;
  } else {
    wheelDelta = e.wheelDelta;
  }

  var direction = wheelDelta < 0 ? -1 : 1;

  var mouseWheelData = {
    element: element,
    viewport: cornerstone.getViewport(element),
    image: enabledElement.image,
    direction: direction,
    pageX: x,
    pageY: y,
    imageX: startingCoords.x,
    imageY: startingCoords.y
  };

  (0, _triggerEvent2.default)(element, _events2.default.MOUSE_WHEEL, mouseWheelData);
}

var mouseWheelEvents = ['mousewheel', 'DOMMouseScroll'];

function enable(element) {
  // Prevent handlers from being attached multiple times
  disable(element);

  mouseWheelEvents.forEach(function (eventType) {
    element.addEventListener(eventType, mouseWheel);
  });
}

function disable(element) {
  mouseWheelEvents.forEach(function (eventType) {
    element.removeEventListener(eventType, mouseWheel);
  });
}

// Module exports
var mouseWheelInput = {
  enable: enable,
  disable: disable
};

exports.default = mouseWheelInput;

/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = __webpack_require__(1);

var _events2 = _interopRequireDefault(_events);

var _externalModules = __webpack_require__(0);

var _externalModules2 = _interopRequireDefault(_externalModules);

var _copyPoints = __webpack_require__(41);

var _copyPoints2 = _interopRequireDefault(_copyPoints);

var _preventGhostClick = __webpack_require__(48);

var _preventGhostClick2 = _interopRequireDefault(_preventGhostClick);

var _triggerEvent = __webpack_require__(3);

var _triggerEvent2 = _interopRequireDefault(_triggerEvent);

var _toolOptions = __webpack_require__(4);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var startPoints = void 0,
    currentPoints = void 0,
    lastPoints = void 0,
    deltaPoints = void 0,
    eventData = void 0,
    touchStartDelay = void 0,
    pressTimeout = void 0,
    pageDistanceMoved = void 0;

var lastScale = 1.0,
    lastRotation = 0.0,
    preventNextPinch = false,
    isPress = false,
    lastDelta = void 0;

var pressDelay = 700,
    pressMaxDistance = 5;

var toolType = 'touchInput';

function onTouch(e) {
  var cornerstone = _externalModules2.default.cornerstone;
  var element = e.currentTarget || e.srcEvent.currentTarget;
  var enabledElement = cornerstone.getEnabledElement(element);

  if (!enabledElement.image) {
    return;
  }

  var eventType = void 0,
      scaleChange = void 0,
      delta = void 0,
      remainingPointers = void 0,
      rotation = void 0;

  // Prevent mouse events from occurring alongside touch events
  e.preventDefault();

  // If more than one finger is placed on the element, stop the press timeout
  if (e.pointers && e.pointers.length > 1 || e.touches && e.touches.length > 1) {
    isPress = false;
    clearTimeout(pressTimeout);
  }

  switch (e.type) {
    case 'tap':
      isPress = false;
      clearTimeout(pressTimeout);

      // Calculate our current points in page and image coordinates
      currentPoints = {
        page: _externalModules2.default.cornerstoneMath.point.pageToPoint(e.pointers[0]),
        image: cornerstone.pageToPixel(element, e.pointers[0].pageX, e.pointers[0].pageY),
        client: {
          x: e.pointers[0].clientX,
          y: e.pointers[0].clientY
        }
      };
      currentPoints.canvas = cornerstone.pixelToCanvas(element, currentPoints.image);

      eventType = _events2.default.TAP;
      eventData = {
        event: e,
        viewport: cornerstone.getViewport(element),
        image: enabledElement.image,
        element: element,
        currentPoints: currentPoints,
        type: eventType,
        isTouchEvent: true
      };

      (0, _triggerEvent2.default)(element, eventType, eventData);
      break;

    case 'doubletap':
      isPress = false;
      clearTimeout(pressTimeout);

      // Calculate our current points in page and image coordinates
      currentPoints = {
        page: _externalModules2.default.cornerstoneMath.point.pageToPoint(e.pointers[0]),
        image: cornerstone.pageToPixel(element, e.pointers[0].pageX, e.pointers[0].pageY),
        client: {
          x: e.pointers[0].clientX,
          y: e.pointers[0].clientY
        }
      };
      currentPoints.canvas = cornerstone.pixelToCanvas(element, currentPoints.image);

      eventType = _events2.default.DOUBLE_TAP;
      eventData = {
        event: e,
        viewport: cornerstone.getViewport(element),
        image: enabledElement.image,
        element: element,
        currentPoints: currentPoints,
        type: eventType,
        isTouchEvent: true
      };

      (0, _triggerEvent2.default)(element, eventType, eventData);
      break;

    case 'pinchstart':
      isPress = false;
      clearTimeout(pressTimeout);

      lastScale = 1.0;
      break;

    case 'pinchmove':
      isPress = false;
      clearTimeout(pressTimeout);

      if (preventNextPinch === true) {
        lastScale = e.scale;
        preventNextPinch = false;
        break;
      }

      scaleChange = (e.scale - lastScale) / lastScale;

      startPoints = {
        page: e.center,
        image: cornerstone.pageToPixel(element, e.center.x, e.center.y)
      };
      startPoints.canvas = cornerstone.pixelToCanvas(element, startPoints.image);

      eventType = _events2.default.TOUCH_PINCH;
      eventData = {
        event: e,
        startPoints: startPoints,
        viewport: cornerstone.getViewport(element),
        image: enabledElement.image,
        element: element,
        direction: e.scale < 1 ? 1 : -1,
        scaleChange: scaleChange,
        type: eventType,
        isTouchEvent: true
      };

      (0, _triggerEvent2.default)(element, eventType, eventData);

      lastScale = e.scale;
      break;

    case 'touchstart':
      lastScale = 1.0;

      clearTimeout(pressTimeout);

      clearTimeout(touchStartDelay);
      touchStartDelay = setTimeout(function () {
        startPoints = {
          page: _externalModules2.default.cornerstoneMath.point.pageToPoint(e.touches[0]),
          image: cornerstone.pageToPixel(element, e.touches[0].pageX, e.touches[0].pageY),
          client: {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
          }
        };
        startPoints.canvas = cornerstone.pixelToCanvas(element, startPoints.image);

        eventType = _events2.default.TOUCH_START;
        if (e.touches.length > 1) {
          eventType = _events2.default.MULTI_TOUCH_START;
        }

        eventData = {
          event: e,
          viewport: cornerstone.getViewport(element),
          image: enabledElement.image,
          element: element,
          startPoints: startPoints,
          currentPoints: startPoints,
          type: eventType,
          isTouchEvent: true
        };

        var eventPropagated = (0, _triggerEvent2.default)(element, eventType, eventData);

        if (eventPropagated === true) {
          // IsPress = false;
          // ClearTimeout(pressTimeout);

          // No current tools responded to the drag action.
          // Create new tool measurement
          eventType = _events2.default.TOUCH_START_ACTIVE;
          if (e.touches.length > 1) {
            eventType = _events2.default.MULTI_TOUCH_START_ACTIVE;
          }

          eventData.type = eventType;
          (0, _triggerEvent2.default)(element, eventType, eventData);
        }

        // Console.log(eventType);
        lastPoints = (0, _copyPoints2.default)(startPoints);
      }, 50);

      isPress = true;
      pageDistanceMoved = 0;
      pressTimeout = setTimeout(function () {
        if (!isPress) {
          return;
        }

        currentPoints = {
          page: _externalModules2.default.cornerstoneMath.point.pageToPoint(e.touches[0]),
          image: cornerstone.pageToPixel(element, e.touches[0].pageX, e.touches[0].pageY),
          client: {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
          }
        };
        currentPoints.canvas = cornerstone.pixelToCanvas(element, startPoints.image);

        eventType = _events2.default.TOUCH_PRESS;
        eventData = {
          event: e,
          viewport: cornerstone.getViewport(element),
          image: enabledElement.image,
          element: element,
          currentPoints: currentPoints,
          type: eventType,
          isTouchEvent: true
        };

        (0, _triggerEvent2.default)(element, eventType, eventData);

        // Console.log(eventType);
      }, pressDelay);
      break;

    case 'touchend':
      lastScale = 1.0;

      isPress = false;
      clearTimeout(pressTimeout);

      setTimeout(function () {
        startPoints = {
          page: _externalModules2.default.cornerstoneMath.point.pageToPoint(e.changedTouches[0]),
          image: cornerstone.pageToPixel(element, e.changedTouches[0].pageX, e.changedTouches[0].pageY),
          client: {
            x: e.changedTouches[0].clientX,
            y: e.changedTouches[0].clientY
          }
        };
        startPoints.canvas = cornerstone.pixelToCanvas(element, startPoints.image);

        eventType = _events2.default.TOUCH_END;

        eventData = {
          event: e,
          viewport: cornerstone.getViewport(element),
          image: enabledElement.image,
          element: element,
          startPoints: startPoints,
          currentPoints: startPoints,
          type: eventType,
          isTouchEvent: true
        };

        (0, _triggerEvent2.default)(element, eventType, eventData);
      }, 50);
      break;

    case 'panmove':
      // Using the delta-value of HammerJS, because it takes all pointers into account
      // This is very important when using panning in combination with pinch-zooming
      // But HammerJS' delta is relative to the start of the pan event
      // So it needs to be converted to a per-event-delta for CornerstoneTools
      delta = {
        x: e.deltaX - lastDelta.x,
        y: e.deltaY - lastDelta.y
      };

      lastDelta = {
        x: e.deltaX,
        y: e.deltaY
      };

      // Calculate our current points in page and image coordinates
      currentPoints = {
        page: {
          x: lastPoints.page.x + delta.x,
          y: lastPoints.page.y + delta.y
        },
        image: cornerstone.pageToPixel(element, lastPoints.page.x + delta.x, lastPoints.page.y + delta.y),
        client: {
          x: lastPoints.client.x + delta.x,
          y: lastPoints.client.y + delta.y
        }
      };
      currentPoints.canvas = cornerstone.pixelToCanvas(element, currentPoints.image);

      // Calculate delta values in page and image coordinates
      deltaPoints = {
        page: _externalModules2.default.cornerstoneMath.point.subtract(currentPoints.page, lastPoints.page),
        image: _externalModules2.default.cornerstoneMath.point.subtract(currentPoints.image, lastPoints.image),
        client: _externalModules2.default.cornerstoneMath.point.subtract(currentPoints.client, lastPoints.client),
        canvas: _externalModules2.default.cornerstoneMath.point.subtract(currentPoints.canvas, lastPoints.canvas)
      };

      pageDistanceMoved += Math.sqrt(deltaPoints.page.x * deltaPoints.page.x + deltaPoints.page.y * deltaPoints.page.y);
      // Console.log("pageDistanceMoved: " + pageDistanceMoved);
      if (pageDistanceMoved > pressMaxDistance) {
        // Console.log('Press event aborted due to movement');
        isPress = false;
        clearTimeout(pressTimeout);
      }

      eventType = _events2.default.TOUCH_DRAG;
      if (e.pointers.length > 1) {
        eventType = _events2.default.MULTI_TOUCH_DRAG;
      }

      eventData = {
        viewport: cornerstone.getViewport(element),
        image: enabledElement.image,
        element: element,
        startPoints: startPoints,
        lastPoints: lastPoints,
        currentPoints: currentPoints,
        deltaPoints: deltaPoints,
        numPointers: e.pointers.length,
        type: eventType,
        isTouchEvent: true
      };

      (0, _triggerEvent2.default)(element, eventType, eventData);

      lastPoints = (0, _copyPoints2.default)(currentPoints);
      break;

    case 'panstart':
      lastDelta = {
        x: e.deltaX,
        y: e.deltaY
      };

      currentPoints = {
        page: _externalModules2.default.cornerstoneMath.point.pageToPoint(e.pointers[0]),
        image: cornerstone.pageToPixel(element, e.pointers[0].pageX, e.pointers[0].pageY),
        client: {
          x: e.pointers[0].clientX,
          y: e.pointers[0].clientY
        }
      };
      currentPoints.canvas = cornerstone.pixelToCanvas(element, currentPoints.image);
      lastPoints = (0, _copyPoints2.default)(currentPoints);
      break;

    case 'panend':
      isPress = false;
      clearTimeout(pressTimeout);

      // If lastPoints is not yet set, it means panend fired without panstart or pan,
      // So we can ignore this event
      if (!lastPoints) {
        return false;
      }

      currentPoints = {
        page: _externalModules2.default.cornerstoneMath.point.pageToPoint(e.pointers[0]),
        image: cornerstone.pageToPixel(element, e.pointers[0].pageX, e.pointers[0].pageY),
        client: {
          x: e.pointers[0].clientX,
          y: e.pointers[0].clientY
        }
      };
      currentPoints.canvas = cornerstone.pixelToCanvas(element, currentPoints.image);

      // Calculate delta values in page and image coordinates
      deltaPoints = {
        page: _externalModules2.default.cornerstoneMath.point.subtract(currentPoints.page, lastPoints.page),
        image: _externalModules2.default.cornerstoneMath.point.subtract(currentPoints.image, lastPoints.image),
        client: _externalModules2.default.cornerstoneMath.point.subtract(currentPoints.client, lastPoints.client),
        canvas: _externalModules2.default.cornerstoneMath.point.subtract(currentPoints.canvas, lastPoints.canvas)
      };

      eventType = _events2.default.TOUCH_DRAG_END;

      eventData = {
        event: e.srcEvent,
        viewport: cornerstone.getViewport(element),
        image: enabledElement.image,
        element: element,
        startPoints: startPoints,
        lastPoints: lastPoints,
        currentPoints: currentPoints,
        deltaPoints: deltaPoints,
        type: eventType,
        isTouchEvent: true
      };

      (0, _triggerEvent2.default)(element, eventType, eventData);

      remainingPointers = e.pointers.length - e.changedPointers.length;

      if (remainingPointers === 2) {
        preventNextPinch = true;
      }
      break;

    case 'rotatemove':
      isPress = false;
      clearTimeout(pressTimeout);

      rotation = e.rotation - lastRotation;

      lastRotation = e.rotation;

      eventType = _events2.default.TOUCH_ROTATE;
      eventData = {
        event: e.srcEvent,
        viewport: cornerstone.getViewport(element),
        image: enabledElement.image,
        element: element,
        rotation: rotation,
        type: eventType
      };
      (0, _triggerEvent2.default)(element, eventType, eventData);
      break;
  }

  return false;
}

function enable(element) {
  disable(element);
  var Hammer = _externalModules2.default.Hammer;

  var hammerOptions = {
    inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput
  };

  var mc = new Hammer.Manager(element, hammerOptions);

  var panOptions = {
    pointers: 0,
    direction: Hammer.DIRECTION_ALL,
    threshold: 0
  };

  var pan = new Hammer.Pan(panOptions);
  var pinch = new Hammer.Pinch({
    threshold: 0
  });
  var rotate = new Hammer.Rotate({
    threshold: 0
  });

  pinch.recognizeWith(pan);
  pinch.recognizeWith(rotate);
  rotate.recognizeWith(pan);

  var doubleTap = new Hammer.Tap({
    event: 'doubletap',
    taps: 2,
    interval: 1500,
    threshold: 50,
    posThreshold: 50
  });

  doubleTap.recognizeWith(pan);

  // Add to the Manager
  mc.add([doubleTap, pan, rotate, pinch]);
  mc.on('tap doubletap panstart panmove panend pinchstart pinchmove rotatemove', onTouch);

  _preventGhostClick2.default.enable(element);

  var touchEvents = ['touchstart', 'touchend'];

  touchEvents.forEach(function (eventType) {
    element.addEventListener(eventType, onTouch);
  });

  var options = (0, _toolOptions.getToolOptions)(toolType, element);

  options.hammer = mc;

  (0, _toolOptions.setToolOptions)(toolType, element, options);
}

function disable(element) {
  _preventGhostClick2.default.disable(element);

  var touchEvents = ['touchstart', 'touchend'];

  touchEvents.forEach(function (eventType) {
    element.removeEventListener(eventType, onTouch);
  });

  var options = (0, _toolOptions.getToolOptions)(toolType, element);
  var mc = options.hammer;

  if (mc) {
    mc.off('tap doubletap panstart panmove panend pinchstart pinchmove rotatemove', onTouch);
  }
}

// Module exports
var touchInput = {
  enable: enable,
  disable: disable
};

exports.default = touchInput;

/***/ })
/******/ ]);
});
//# sourceMappingURL=cornerstoneTools.js.map