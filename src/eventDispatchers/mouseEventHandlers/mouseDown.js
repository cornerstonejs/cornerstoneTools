// State
import { getters, state } from './../../store/index.js';
import { getToolState } from './../../stateManagement/toolState.js';
// Manipulators
import getHandleNearImagePoint from './../../manipulators/getHandleNearImagePoint.js';
import moveAllHandles from './../../manipulators/moveAllHandles.js';
import moveHandle from './../../manipulators/moveHandle.js';
// Util
import isMouseButtonEnabled from './../../util/isMouseButtonEnabled.js';
// Todo: Where should these live?
import getInteractiveToolsForElement from './../../store/getInteractiveToolsForElement.js';
import getToolsWithDataForElement from './../../store/getToolsWithDataForElement.js';

// Note: if we find a match, we need to record that we're holding down on a tool
// So we don't fire the mouse_move event listener
// On pick-up, we need to "release", so we can re-enable the mouse_move listener
/**
 * MouseDown is called before MouseDownActivate. If MouseDown
 * finds an existing tool to interact with, it can prevent the
 * event from bubbling to MouseDownActivate.
 *
 * @param {*} evt
 * @returns
 */
export default function (evt) {
  if (state.isToolLocked) {
    return;
  }

  let tools;
  const eventData = evt.detail;
  const element = eventData.element;
  const coords = eventData.currentPoints.canvas;
  const distance = 6;

  // TODO: instead of filtering these for every interaction, we can change our
  // State's structure to always know these values.
  // Filter out disabled and enabled
  tools = getInteractiveToolsForElement(element, getters.mouseTools());
  // Filter out tools that do not match mouseButtonMask
  tools = tools.filter((tool) =>
    isMouseButtonEnabled(eventData.which, tool.options.mouseButtonMask)
  );
  tools = getToolsWithDataForElement(element, tools);

  // Find tools with handles we can move
  const toolsWithMoveableHandles = tools.filter((tool) => {
    const toolState = getToolState(eventData.element, tool.name);

    for (let i = 0; i < toolState.data.length; i++) {
      if (
        getHandleNearImagePoint(
          element,
          toolState.data[i].handles,
          coords,
          distance
        ) !== undefined
      ) {
        return true;
      }
    }

    return false;
  });
  // TODO: More than one? Which one was moved most recently?
  // We'll just grab the first one we encounter for now

  if (toolsWithMoveableHandles.length > 0) {
    const toolState = getToolState(
      eventData.element,
      toolsWithMoveableHandles[0].name
    );

    for (let i = 0; i < toolState.data.length; i++) {
      const data = toolState.data[i];
      const distance = 6;
      const handle = getHandleNearImagePoint(
        element,
        data.handles,
        coords,
        distance
      );

      if (handle) {
        // Todo: We've grabbed a handle, stop listening/ignore for MOUSE_MOVE
        data.active = true;
        moveHandle(
          eventData,
          toolsWithMoveableHandles[0].name,
          data,
          handle,
          () => {}, // HandleDoneMove,
          true // PreventHandleOutsideImage
        );
        evt.stopImmediatePropagation();
        evt.stopPropagation();
        evt.preventDefault();

        return;
      }
    }
  }

  // None? Next.

  // First tool with a point near us
  // See if there is a tool we can move
  tools = tools.find((tool) => {
    const toolState = getToolState(eventData.element, tool.name);
    const opt = tool.options || {
      deleteIfHandleOutsideImage: true,
      preventHandleOutsideImage: false
    };

    for (let i = 0; i < toolState.data.length; i++) {
      const data = toolState.data[i];

      data.active = false;
      if (tool.pointNearTool && tool.pointNearTool(element, data, coords)) {
        data.active = true;
        // Todo: ignore MOUSE_MOVE for a bit
        moveAllHandles(
          evt,
          data,
          toolState,
          tool.name,
          opt,
          () => {} /* HandleDoneMove */
        );

        evt.stopImmediatePropagation();
        evt.stopPropagation();
        evt.preventDefault();

        return;
      }
    }
  });

  // Function handleDoneMove () {
  //   Data.invalidated = true;
  //   If (anyHandlesOutsideImage(eventData, data.handles)) {
  // 	// Delete the measurement
  // 	RemoveToolState(element, toolType, data);
  //   }

  //   External.cornerstone.updateImage(element);
  //   Element.addEventListener(EVENTS.MOUSE_MOVE, mouseMove);
  // }
}
