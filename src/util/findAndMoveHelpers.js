import { state } from '../store/index.js';
import getHandleNearImagePoint from '../manipulators/getHandleNearImagePoint.js';
import moveAllHandles from '../manipulators/moveAllHandles.js';
import moveHandle from '../manipulators/moveHandle.js';


/**
 * Moves a handle near the image point.
 * @export @public @method
 * @name moveHandleNearImagePoint
 *
 * @param  {Event} evt      The event.
 * @param  {object} handle  The handle to be moved.
 * @param  {object} data     The toolData that corresponds to the handle.
 * @param  {string} toolName The name of the tool the handle corrosponds to.
 */
const moveHandleNearImagePoint = function (evt, handle, data, toolName) {
  data.active = true;
  state.isToolLocked = true;

  moveHandle(
    evt.detail,
    toolName,
    data,
    handle,
    () => {
      data.active = false;
      state.isToolLocked = false;
    },
    true // PreventHandleOutsideImage
  );

  evt.stopImmediatePropagation();
  evt.stopPropagation();
  evt.preventDefault();

  return;
};

/**
 * Finds the handle near the image point and its corresponding data.
 * @export @public @method
 * @name findHandleDataNearImagePoint
 *
 * @param  {HTMLElement} element  The elment.
 * @param  {Event}  evt           The event.
 * @param  {object} toolState     The state of the tool.
 * @param  {string} toolName The name of the tool the handle corrosponds to.
 * @param  {object} coords The coordinates that need to be checked.
 */
const findHandleDataNearImagePoint = function (
  element,
  evt,
  toolState,
  toolName,
  coords
) {
  for (let i = 0; i < toolState.data.length; i++) {
    const data = toolState.data[i];
    const handle = getHandleNearImagePoint(
      element,
      data.handles,
      coords,
      state.clickProximity
    );

    if (handle) {
      return {
        handle,
        data
      };
    }
  }
};

/**
 * Moves an entire annotation near the click.
 * @export @public @method
 * @name moveAnnotationNearClick
 *
 * @param  {Event}  evt           The event.
 * @param  {object} toolState     The state of the tool.
 * @param  {object} tool The tool that the annotation belongs to.
 * @param  {object} data The toolData that corresponds to the annotation.
 */
const moveAnnotationNearClick = function (evt, toolState, tool, data) {
  const opt = tool.options || {
    deleteIfHandleOutsideImage: true,
    preventHandleOutsideImage: false
  };

  data.active = true;
  state.isToolLocked = true;
  // TODO: Ignore MOUSE_MOVE for a bit
  // TODO: Why do this and `moveHandle` expose this in different
  // TODO: ways? PreventHandleOutsideImage
  moveAllHandles(evt, data, toolState, tool.name, opt, () => {
    data.active = false;
    state.isToolLocked = false;
  });

  evt.stopImmediatePropagation();
  evt.stopPropagation();
  evt.preventDefault();

  return;
};

/**
 * Finds the annotation near the image point.
 * @export @public @method
 * @name findAnnotationNearClick
 *
 * @param  {HTMLElement} element  The elment.
 * @param  {Event}  evt           The event.
 * @param  {object} toolState     The state of the tool.
 * @param  {string} tool The tool that the annotation belongs to.
 * @param  {object} coords The coordinates that need to be checked.
 */
const findAnnotationNearClick = function (
  element,
  evt,
  toolState,
  tool,
  coords
) {
  for (let i = 0; i < toolState.data.length; i++) {
    const data = toolState.data[i];
    const isNearPoint = tool.pointNearTool(element, data, coords);

    if (isNearPoint) {
      return data;
    }
  }
};

export {
  moveHandleNearImagePoint,
  findHandleDataNearImagePoint,
  moveAnnotationNearClick,
  findAnnotationNearClick
};
