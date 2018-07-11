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

	mouseMove(){

	}

	mouseDown() {

	}

	mouseDownActivate(evt) {
		const eventData = e.detail;
		const element = eventData.element;
		
		// Filter out disabled and enabled
		// Filter out !isMouseButtonEnabled(eventData.which, options.mouseButtonMask)

		// if: addNewMeasurement --> tool.addNewMeasurement()

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

  function mouseDownActivateCallback (e) {
    const eventData = e.detail;
    const element = eventData.element;
    const options = getToolOptions(toolType, element);

    if (!isMouseButtonEnabled(eventData.which, options.mouseButtonMask)) {
      return;
    }

    if (mouseToolInterface.addNewMeasurement) {
      mouseToolInterface.addNewMeasurement(eventData);
    } else {
      addNewMeasurement(eventData);
    }

    e.preventDefault();
    e.stopPropagation();
  }

  // /////// END ACTIVE TOOL ///////

  // /////// BEGIN DEACTIVE TOOL ///////

  function mouseMoveCallback (e) {
    const eventData = e.detail;

    toolCoordinates.setCoords(eventData);

    // If we have no tool data for this element, do nothing
    const toolData = getToolState(eventData.element, toolType);

    if (!toolData) {
      return;
    }

    // We have tool data, search through all data
    // And see if we can activate a handle
    let imageNeedsUpdate = false;

    for (let i = 0; i < toolData.data.length; i++) {
      // Get the cursor position in canvas coordinates
      const coords = eventData.currentPoints.canvas;

      const data = toolData.data[i];

      if (handleActivator(eventData.element, data.handles, coords) === true) {
        imageNeedsUpdate = true;
      }

      if (
        (mouseToolInterface.pointNearTool(eventData.element, data, coords) &&
          !data.active) ||
        (!mouseToolInterface.pointNearTool(eventData.element, data, coords) &&
          data.active)
      ) {
        data.active = !data.active;
        imageNeedsUpdate = true;
      }
    }

    // Handle activation status changed, redraw the image
    if (imageNeedsUpdate === true) {
      external.cornerstone.updateImage(eventData.element);
    }
  }

  function mouseDownCallback (e) {
    const eventData = e.detail;
    let data;
    const element = eventData.element;
    const options = getToolOptions(toolType, element);

    if (!isMouseButtonEnabled(eventData.which, options.mouseButtonMask)) {
      return;
    }

    function handleDoneMove () {
      data.invalidated = true;
      if (anyHandlesOutsideImage(eventData, data.handles)) {
        // Delete the measurement
        removeToolState(element, toolType, data);
      }

      external.cornerstone.updateImage(element);
      element.addEventListener(EVENTS.MOUSE_MOVE, mouseMove);
    }

    const coords = eventData.startPoints.canvas;
    const toolData = getToolState(e.currentTarget, toolType);

    if (!toolData) {
      return;
    }

    let i;

    // Now check to see if there is a handle we can move

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

    for (i = 0; i < toolData.data.length; i++) {
      data = toolData.data[i];
      const distance = 6;
      const handle = getHandleNearImagePoint(
        element,
        data.handles,
        coords,
        distance
      );

      if (handle) {
        element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMove);
        data.active = true;
        moveHandle(
          eventData,
          toolType,
          data,
          handle,
          handleDoneMove,
          preventHandleOutsideImage
        );
        e.stopImmediatePropagation();
        e.stopPropagation();
        e.preventDefault();

        return;
      }
    }

    // Now check to see if there is a line we can move
    // Now check to see if we have a tool that we can move
    if (!mouseToolInterface.pointNearTool) {
      return;
    }

    const opt = mouseToolInterface.options || {
      deleteIfHandleOutsideImage: true,
      preventHandleOutsideImage: false
    };

    for (i = 0; i < toolData.data.length; i++) {
      data = toolData.data[i];
      data.active = false;
      if (mouseToolInterface.pointNearTool(element, data, coords)) {
        data.active = true;
        element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMove);
        moveAllHandles(e, data, toolData, toolType, opt, handleDoneMove);
        e.stopImmediatePropagation();
        e.stopPropagation();
        e.preventDefault();

        return;
      }
    }
  }
  // /////// END DEACTIVE TOOL ///////

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

  // Not visible, not interactive
  function disable (element) {
    element.removeEventListener(
      EVENTS.IMAGE_RENDERED,
      mouseToolInterface.onImageRendered
    );
    element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMove);
    element.removeEventListener(EVENTS.MOUSE_DOWN, mouseDown);
    element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivate);

    if (mouseDoubleClick) {
      element.removeEventListener(EVENTS.MOUSE_DOUBLE_CLICK, mouseDoubleClick);
    }

    external.cornerstone.updateImage(element);
  }

  // Visible but not interactive
  function enable (element) {
    element.removeEventListener(
      EVENTS.IMAGE_RENDERED,
      mouseToolInterface.onImageRendered
    );
    element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMove);
    element.removeEventListener(EVENTS.MOUSE_DOWN, mouseDown);
    element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivate);

    if (mouseDoubleClick) {
      element.removeEventListener(EVENTS.MOUSE_DOUBLE_CLICK, mouseDoubleClick);
    }

    element.addEventListener(
      EVENTS.IMAGE_RENDERED,
      mouseToolInterface.onImageRendered
    );

    external.cornerstone.updateImage(element);
  }

  // Visible, interactive and can create
  function activate (element, mouseButtonMask) {
    setToolOptions(toolType, element, { mouseButtonMask });

    element.removeEventListener(
      EVENTS.IMAGE_RENDERED,
      mouseToolInterface.onImageRendered
    );
    element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMove);
    element.removeEventListener(EVENTS.MOUSE_DOWN, mouseDown);
    element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivate);

    element.addEventListener(
      EVENTS.IMAGE_RENDERED,
      mouseToolInterface.onImageRendered
    );
    element.addEventListener(EVENTS.MOUSE_MOVE, mouseMove);
    element.addEventListener(EVENTS.MOUSE_DOWN, mouseDown);
    element.addEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivate);

    if (mouseDoubleClick) {
      element.removeEventListener(EVENTS.MOUSE_DOUBLE_CLICK, mouseDoubleClick);
      element.addEventListener(EVENTS.MOUSE_DOUBLE_CLICK, mouseDoubleClick);
    }

    external.cornerstone.updateImage(element);
  }

  // Visible, interactive
  function deactivate (element, mouseButtonMask) {
    setToolOptions(toolType, element, { mouseButtonMask });

    const eventType = EVENTS.TOOL_DEACTIVATED;
    const statusChangeEventData = {
      mouseButtonMask,
      toolType,
      type: eventType
    };

    triggerEvent(element, eventType, statusChangeEventData);

    element.removeEventListener(
      EVENTS.IMAGE_RENDERED,
      mouseToolInterface.onImageRendered
    );
    element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMove);
    element.removeEventListener(EVENTS.MOUSE_DOWN, mouseDown);
    element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivate);

    element.addEventListener(
      EVENTS.IMAGE_RENDERED,
      mouseToolInterface.onImageRendered
    );
    element.addEventListener(EVENTS.MOUSE_MOVE, mouseMove);
    element.addEventListener(EVENTS.MOUSE_DOWN, mouseDown);

    if (mouseDoubleClick) {
      element.removeEventListener(EVENTS.MOUSE_DOUBLE_CLICK, mouseDoubleClick);
      element.addEventListener(EVENTS.MOUSE_DOUBLE_CLICK, mouseDoubleClick);
    }

    if (mouseToolInterface.deactivate) {
      mouseToolInterface.deactivate(element, mouseButtonMask);
    }

    external.cornerstone.updateImage(element);
  }
}
