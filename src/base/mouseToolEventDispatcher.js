import EVENTS from './../events.js';
import state from './../store/index.js';
import isMouseButtonEnabled from './../util/isMouseButtonEnabled.js';
import { getToolState } from './../stateManagement/toolState.js';
import getHandleNearImagePoint from './../manipulators/getHandleNearImagePoint.js';
import moveHandle from './../manipulators/moveHandle.js';

const getInteractiveToolsForElement = function (element, tools) {
  return tools.filter(
    (tool) =>
      tool.element === element &&
      (tool.mode === 'active' || tool.mode === 'passive')
  );
};

export default class {
  constructor (element) {
    element.addEventListener(EVENTS.MOUSE_MOVE, this.mouseMove);
    element.addEventListener(EVENTS.MOUSE_DOWN, this.mouseDown);
    element.addEventListener(
      EVENTS.MOUSE_DOWN_ACTIVATE,
      this.mouseDownActivate
    );
    element.addEventListener(EVENTS.MOUSE_DOUBLE_CLICK, this.mouseDoubleClick);
    element.addEventListener(
      EVENTS.IMAGE_RENDERED,
      mouseToolInterface.onImageRendered
    );
  }

  // Qualifieres
  // - Matching mouseButtonMask
  // - Tool State
  //     - Passive, touching
  //     - Active, ONLY or closest
  // - Handle or PointNearTool

  mouseMove (evt) {
    const eventData = evt.detail;

    // What does this do?
    // ToolCoordinates.setCoords(eventData);

    // Filter out disabled and enabled
    // Filter out no tool data
    // Const toolData = getToolState(eventData.element, toolType);

    // If (!toolData) {
    //   Return;
    // }

    // Find closest or most recently touched tool?
    // - Iterate over each tool's data?
    // - Use new distanceFromTool method on baseAnnotationTool (if it exist?)
    // Use closest or most recently touched w/ handleActivator and/or pointNearTool
  }

  // Note: if we find a match, we need to record that we're holding down on a tool
  // So we don't fire the mouse_move event listener
  // On pick-up, we need to "release", so we can re-enable the mouse_move listener
  mouseDown (evt) {
    const eventData = evt.detail;
    const element = eventData.element;
    const coords = eventData.currentPoints.canvas;
    const distance = 6;

    // TODO: instead of filtering these for every interaction, we can change our
    // State's structure to always know these values.
    // Filter out disabled and enabled
    let tools = this.getInteractiveToolsForElement(element, state.tools);

    // Filter out tools that do not match mouseButtonMask
    tools = tools.filter((tool) =>
      isMouseButtonEnabled(eventData.which, tool.options.mouseButtonMask)
    );

    // Filter out tools w/ no data
    tools = tools.filter(
      (tool) => getToolState(eventData.element, tool.toolName).length > 0
    );

    // Find tools with handles we can move
    const toolsWithMoveableHandles = tools.filter((tool) => {
      const toolState = getToolState(eventData.element, tool.toolName);

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
        toolsWithMoveableHandles[0].toolName
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
            toolsWithMoveableHandles[0].toolName,
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
      const toolState = getToolState(eventData.element, tool.toolName);

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
            tool.toolName,
            opt,
            () => {} /* HandleDoneMove */
          );
        }
      }
    });
    const opt = mouseToolInterface.options || {
      deleteIfHandleOutsideImage: true,
      preventHandleOutsideImage: false
    };

    // 	Element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMove);
    // 	MoveAllHandles(e, data, toolData, toolType, opt, handleDoneMove);
    // 	E.stopImmediatePropagation();
    // 	E.stopPropagation();
    // 	E.preventDefault();

    // 	Return;
    //   }
    // }

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

  mouseDownActivate (evt) {
    const eventData = evt.detail;
    const element = eventData.element;

    // Filter out disabled and enabled
    // Filter out !isMouseButtonEnabled(eventData.which, options.mouseButtonMask)

    // If: addNewMeasurement --> tool.addNewMeasurement()
    // Or use Default method?

    e.preventDefault();
    e.stopPropagation();
  }

  mouseDoubleClick () {}

  onImageRendered () {}
}

// Export default function (mouseToolInterface) {
//   Let configuration = {};
//   Const toolType = mouseToolInterface.toolType;

//   Const mouseMove = mouseToolInterface.mouseMoveCallback || mouseMoveCallback;
//   Const mouseDown = mouseToolInterface.mouseDownCallback || mouseDownCallback;
//   Const mouseDownActivate =
//     MouseToolInterface.mouseDownActivateCallback || mouseDownActivateCallback;
//   Const mouseDoubleClick = mouseToolInterface.mouseDoubleClickCallback;

//   // /////// BEGIN ACTIVE TOOL ///////
//   Function addNewMeasurement (mouseEventData) {
//     Const cornerstone = external.cornerstone;
//     Const element = mouseEventData.element;

//     Const measurementData = mouseToolInterface.createNewMeasurement(
//       MouseEventData
//     );

//     If (!measurementData) {
//       Return;
//     }

//     // Associate this data with this imageId so we can render it and manipulate it
//     AddToolState(mouseEventData.element, toolType, measurementData);

//     // Since we are dragging to another place to drop the end point, we can just activate
//     // The end point and let the moveHandle move it for us.
//     Element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMove);
//     Element.removeEventListener(EVENTS.MOUSE_DOWN, mouseDown);
//     Element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivate);

//     If (mouseDoubleClick) {
//       Element.removeEventListener(EVENTS.MOUSE_DOUBLE_CLICK, mouseDoubleClick);
//     }

//     Cornerstone.updateImage(element);

//     Let handleMover;

//     If (Object.keys(measurementData.handles).length === 1) {
//       HandleMover = moveHandle;
//     } else {
//       HandleMover = moveNewHandle;
//     }

//     Let preventHandleOutsideImage;

//     If (
//       MouseToolInterface.options &&
//       MouseToolInterface.options.preventHandleOutsideImage !== undefined
//     ) {
//       PreventHandleOutsideImage =
//         MouseToolInterface.options.preventHandleOutsideImage;
//     } else {
//       PreventHandleOutsideImage = false;
//     }

//     HandleMover(
//       MouseEventData,
//       ToolType,
//       MeasurementData,
//       MeasurementData.handles.end,
//       Function () {
//         MeasurementData.active = false;
//         MeasurementData.invalidated = true;
//         If (anyHandlesOutsideImage(mouseEventData, measurementData.handles)) {
//           // Delete the measurement
//           RemoveToolState(element, toolType, measurementData);
//         }

//         Element.addEventListener(EVENTS.MOUSE_MOVE, mouseMove);
//         Element.addEventListener(EVENTS.MOUSE_DOWN, mouseDown);
//         Element.addEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivate);

//         If (mouseDoubleClick) {
//           Element.addEventListener(EVENTS.MOUSE_DOUBLE_CLICK, mouseDoubleClick);
//         }

//         Cornerstone.updateImage(element);
//       },
//       PreventHandleOutsideImage
//     );
//   }
// }
