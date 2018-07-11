import EVENTS from '../events.js';

export default class {
	constructor(){
		element.addEventListener(EVENTS.MOUSE_MOVE, mouseMove);
        element.addEventListener(EVENTS.MOUSE_DOWN, mouseDown);
		element.addEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivate);
		element.addEventListener(EVENTS.MOUSE_DOUBLE_CLICK, mouseDoubleClick);
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

	mouseMove(evt){
		const eventData = evt.detail;

		// What does this do?
		// toolCoordinates.setCoords(eventData);
	
		// Filter out disabled and enabled
		// Filter out no tool data
		// const toolData = getToolState(eventData.element, toolType);
	
		// if (!toolData) {
		//   return;
		// }
	
		// Find closest or most recently touched tool?
		// - Iterate over each tool's data?
		// - Use new distanceFromTool method on baseAnnotationTool (if it exist?)
		// Use closest or most recently touched w/ handleActivator and/or pointNearTool
	}

	// Note: if we find a match, we need to record that we're holding down on a tool
	// so we don't fire the mouse_move event listener
	// On pick-up, we need to "release", so we can re-enable the mouse_move listener
	mouseDown(evt) {
		const eventData = evt.detail;
		let data;
		const element = eventData.element;
		const options = getToolOptions(toolType, element);
		
		// Filter out disabled and enabled
		// Filter out no tool data
		// Filter out !isMouseButtonEnabled(eventData.which, options.mouseButtonMask)


	
		// function handleDoneMove () {
		//   data.invalidated = true;
		//   if (anyHandlesOutsideImage(eventData, data.handles)) {
		// 	// Delete the measurement
		// 	removeToolState(element, toolType, data);
		//   }
	
		//   external.cornerstone.updateImage(element);
		//   element.addEventListener(EVENTS.MOUSE_MOVE, mouseMove);
		// }
	

		// Now check to see if there is a handle we can move
		// let i;
		// for (i = 0; i < toolData.data.length; i++) {
		//   data = toolData.data[i];
		//   const distance = 6;
		//   const handle = getHandleNearImagePoint(
		// 	element,
		// 	data.handles,
		// 	coords,
		// 	distance
		//   );
	
		//   if (handle) {
		// 	element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMove);
		// 	data.active = true;
		// 	moveHandle(
		// 	  eventData,
		// 	  toolType,
		// 	  data,
		// 	  handle,
		// 	  handleDoneMove,
		// 	  preventHandleOutsideImage
		// 	);
		// 	e.stopImmediatePropagation();
		// 	e.stopPropagation();
		// 	e.preventDefault();
	
		// 	return;
		//   }
		// }
	

		// FilterOut tools w/ no pointNearTool method
		// See if there is a tool we can move
		// const opt = mouseToolInterface.options || {
		//   deleteIfHandleOutsideImage: true,
		//   preventHandleOutsideImage: false
		// };
	
		// for (i = 0; i < toolData.data.length; i++) {
		//   data = toolData.data[i];
		//   data.active = false;
		//   if (mouseToolInterface.pointNearTool(element, data, coords)) {
		// 	data.active = true;
		// 	element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMove);
		// 	moveAllHandles(e, data, toolData, toolType, opt, handleDoneMove);
		// 	e.stopImmediatePropagation();
		// 	e.stopPropagation();
		// 	e.preventDefault();
	
		// 	return;
		//   }
		// }
	}

	mouseDownActivate(evt) {
		const eventData = evt.detail;
		const element = eventData.element;
		
		// Filter out disabled and enabled
		// Filter out !isMouseButtonEnabled(eventData.which, options.mouseButtonMask)

		// if: addNewMeasurement --> tool.addNewMeasurement()
		// Or use Default method?

		e.preventDefault();
    	e.stopPropagation();
	}

	mouseDoubleClick() {

	}

	onImageRendered() {

	}
}

export default function (mouseToolInterface) {
  let configuration = {};
  const toolType = mouseToolInterface.toolType;

  const mouseMove = mouseToolInterface.mouseMoveCallback || mouseMoveCallback;
  const mouseDown = mouseToolInterface.mouseDownCallback || mouseDownCallback;
  const mouseDownActivate =
    mouseToolInterface.mouseDownActivateCallback || mouseDownActivateCallback;
  const mouseDoubleClick = mouseToolInterface.mouseDoubleClickCallback;

  // /////// BEGIN ACTIVE TOOL ///////
  function addNewMeasurement (mouseEventData) {
    const cornerstone = external.cornerstone;
    const element = mouseEventData.element;

    const measurementData = mouseToolInterface.createNewMeasurement(
      mouseEventData
    );

    if (!measurementData) {
      return;
    }

    // Associate this data with this imageId so we can render it and manipulate it
    addToolState(mouseEventData.element, toolType, measurementData);

    // Since we are dragging to another place to drop the end point, we can just activate
    // The end point and let the moveHandle move it for us.
    element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMove);
    element.removeEventListener(EVENTS.MOUSE_DOWN, mouseDown);
    element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivate);

    if (mouseDoubleClick) {
      element.removeEventListener(EVENTS.MOUSE_DOUBLE_CLICK, mouseDoubleClick);
    }

    cornerstone.updateImage(element);

    let handleMover;

    if (Object.keys(measurementData.handles).length === 1) {
      handleMover = moveHandle;
    } else {
      handleMover = moveNewHandle;
    }

    let preventHandleOutsideImage;

    if (
      mouseToolInterface.options &&
      mouseToolInterface.options.preventHandleOutsideImage !== undefined
    ) {
      preventHandleOutsideImage =
        mouseToolInterface.options.preventHandleOutsideImage;
    } else {
      preventHandleOutsideImage = false;
    }

    handleMover(
      mouseEventData,
      toolType,
      measurementData,
      measurementData.handles.end,
      function () {
        measurementData.active = false;
        measurementData.invalidated = true;
        if (anyHandlesOutsideImage(mouseEventData, measurementData.handles)) {
          // Delete the measurement
          removeToolState(element, toolType, measurementData);
        }

        element.addEventListener(EVENTS.MOUSE_MOVE, mouseMove);
        element.addEventListener(EVENTS.MOUSE_DOWN, mouseDown);
        element.addEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivate);

        if (mouseDoubleClick) {
          element.addEventListener(EVENTS.MOUSE_DOUBLE_CLICK, mouseDoubleClick);
        }

        cornerstone.updateImage(element);
      },
      preventHandleOutsideImage
    );
  }
}
