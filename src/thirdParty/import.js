import BaseTool from '../base/BaseTool.js';
import BaseAnnotationTool from '../base/BaseAnnotationTool.js';
import BaseBrushTool from '../base/BaseBrushTool.js';

import anyHandlesOutsideImage from '../manipulators/anyHandlesOutsideImage.js';
import drawHandles from '../manipulators/drawHandles.js';
import getHandleNearImagePoint from '../manipulators/getHandleNearImagePoint.js';
import handleActivator from '../manipulators/handleActivator.js';
import moveAllHandles from '../manipulators/moveAllHandles.js';
import moveHandle from '../manipulators/moveHandle.js';
import moveNewHandle from '../manipulators/moveNewHandle.js';
import moveNewHandleTouch from '../manipulators/moveNewHandleTouch.js';
import touchMoveAllHandles from '../manipulators/touchMoveAllHandles.js';
import touchMoveHandle from '../manipulators/touchMoveHandle.js';

import mixins from '../mixins/index.js';

import textStyle from '../stateManagement/textStyle.js';
import toolColors from '../stateManagement/toolColors.js';
import toolCoordinates from '../stateManagement/toolCoordinates.js';
import {
  addToolState,
  getToolState,
  removeToolState,
  clearToolState
} from '../stateManagement/toolState.js';
import {
  modules,
  state,
  getters
} from '../store/index.js';
import {
  setToolPassiveForElement,
  setToolActiveForElement,
  setToolEnabledForElement,
  setToolDisabledForElement
} from '../store/setToolMode.js';


/**
 * anonymous function - description
 *
 * @param  {string} item the import path for the entity to import.
 * @return {Class|Object}
 */
export default function (uri) {
  const splitUri = uri.split('/');
  const depth = splitUri.length;

  let [namespace, directory, item] = splitUri;

  if (depth > 3) {
    console.warn(`${uri} doesn't exist, too deep.`);
  }

  // Check that whatever is being requested exists.
  if (depth >= 1 && !library[namespace]) {
    console.warn(`Namespace ${namespace} does not exist.`);
    return;
  }

  if (depth >= 2 && !library[namespace][directory]) {
    console.warn(`${namespace}/${directory} does not exist.`);
    return;
  }

  if (depth === 3 && !library[namespace][directory][item]) {
    console.warn(`${namespace}/${directory}/${item} does not exist.`);
    return;
  }

  switch (depth) {
    case 1:
      return library[namespace];
    case 2:
      return library[namespace][directory];
    case 3:
      return library[namespace][directory][item];
  }
}

const library = {
  core: {
    base: {
      BaseTool,
      BaseAnnotationTool,
      BaseBrushTool
    },
    manipulators: {
      anyHandlesOutsideImage,
      drawHandles,
      getHandleNearImagePoint,
      handleActivator,
      moveAllHandles,
      moveHandle,
      moveNewHandle,
      moveNewHandleTouch,
      touchMoveAllHandles,
      touchMoveHandle
    },
    mixins: {
      activeOrDisabledBinaryTool: mixins.activeOrDisabledBinaryTool, // Note: Change the way mixins are registered.
      enabledOrDisabledBinaryTool: mixins.enabledOrDisabledBinaryTool
    },
    stateManagement: {
      textStyle,
      toolColors,
      toolCoordinates,
      addToolState,
      getToolState,
      removeToolState,
      clearToolState
    },
    store: {
      state,
      modules,
      getters,
      setToolPassiveForElement,
      setToolActiveForElement,
      setToolDisabledForElement,
      setToolEnabledForElement
    },
    drawing: {
      getNewContext,
      draw,
      path,
      setShadow,
      drawLine,
      drawLines,
      drawJoinedLines,
      drawCircle,
      drawRect,
      fillBox,
      fillTextLines
    }

  }
};


import {
  getNewContext,
  draw,
  path,
  setShadow,
  drawLine,
  drawLines,
  drawJoinedLines,
  drawCircle,
  drawEllipse,
  drawRect,
  fillBox,
  fillTextLines
} from '../util/drawing.js';
