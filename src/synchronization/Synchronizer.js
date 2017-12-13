import EVENTS from '../events.js';
import external from '../externalModules.js';
import convertToVector3 from '../util/convertToVector3.js';

function unique (array) {
  return array.filter(function (value, index, self) {
    return self.indexOf(value) === index;
  });
}

// This object is responsible for synchronizing target elements when an event fires on a source
// Element
function Synchronizer (event, handler) {
  const cornerstone = external.cornerstone;
  const that = this;
  const sourceElements = []; // Source elements fire the events we want to synchronize to
  const targetElements = []; // Target elements we want to synchronize to source elements

  let ignoreFiredEvents = false;
  const initialData = {};
  let eventHandler = handler;

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
      const sourceEnabledElement = cornerstone.getEnabledElement(sourceElement);

      if (!sourceEnabledElement || !sourceEnabledElement.image) {
        return;
      }

      const sourceImageId = sourceEnabledElement.image.imageId;
      const sourceImagePlane = cornerstone.metaData.get('imagePlaneModule', sourceImageId);

      if (!sourceImagePlane || !sourceImagePlane.imagePositionPatient) {
        return;
      }

      const sourceImagePosition = convertToVector3(sourceImagePlane.imagePositionPatient);

      if (initialData.hasOwnProperty(sourceEnabledElement)) {
        return;
      }
      initialData.distances[sourceImageId] = {};


      initialData.imageIds.sourceElements.push(sourceImageId);

      targetElements.forEach(function (targetElement) {
        const targetEnabledElement = cornerstone.getEnabledElement(targetElement);

        if (!targetEnabledElement || !targetEnabledElement.image) {
          return;
        }

        const targetImageId = targetEnabledElement.image.imageId;

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

        const targetImagePlane = cornerstone.metaData.get('imagePlaneModule', targetImageId);

        if (!targetImagePlane || !targetImagePlane.imagePositionPatient) {
          return;
        }

        const targetImagePosition = convertToVector3(targetImagePlane.imagePositionPatient);

        initialData.distances[sourceImageId][targetImageId] = targetImagePosition.clone().sub(sourceImagePosition);
      });

      if (!Object.keys(initialData.distances[sourceImageId]).length) {
        delete initialData.distances[sourceImageId];
      }
    });
  };

  function fireEvent (sourceElement, eventData) {
    // Broadcast an event that something changed
    if (!sourceElements.length || !targetElements.length) {
      return;
    }

    ignoreFiredEvents = true;
    targetElements.forEach(function (targetElement) {
      const targetIndex = targetElements.indexOf(targetElement);

      if (targetIndex === -1) {
        return;
      }

      const targetImageId = initialData.imageIds.targetElements[targetIndex];
      const sourceIndex = sourceElements.indexOf(sourceElement);

      if (sourceIndex === -1) {
        return;
      }

      const sourceImageId = initialData.imageIds.sourceElements[sourceIndex];

      let positionDifference;

      if (sourceImageId === targetImageId) {
        positionDifference = 0;
      } else if (initialData.distances[sourceImageId] !== undefined) {
        positionDifference = initialData.distances[sourceImageId][targetImageId];
      }

      eventHandler(that, sourceElement, targetElement, eventData, positionDifference);
    });
    ignoreFiredEvents = false;
  }

  function onEvent (e) {
    const eventData = e.detail;

    if (ignoreFiredEvents === true) {
      return;
    }

    fireEvent(e.currentTarget, eventData);
  }

  // Adds an element as a source
  this.addSource = function (element) {
    // Return if this element was previously added
    const index = sourceElements.indexOf(element);

    if (index !== -1) {
      return;
    }

    // Add to our list of enabled elements
    sourceElements.push(element);

    // Subscribe to the event
    element.addEventListener(event, onEvent);

    // Update the initial distances between elements
    that.getDistances();

    that.updateDisableHandlers();
  };

  // Adds an element as a target
  this.addTarget = function (element) {
    // Return if this element was previously added
    const index = targetElements.indexOf(element);

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
    const index = sourceElements.indexOf(element);

    if (index === -1) {
      return;
    }

    // Remove this element from the array
    sourceElements.splice(index, 1);

    // Stop listening for the event
    element.removeEventListener(event, onEvent);

    // Update the initial distances between elements
    that.getDistances();

    // Update everyone listening for events
    fireEvent(element);
    that.updateDisableHandlers();
  };

  // Removes an element as a target
  this.removeTarget = function (element) {
    // Find the index of this element
    const index = targetElements.indexOf(element);

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

  function disableHandler (e) {
    const element = e.detail.element;

    that.remove(element);
  }

  this.updateDisableHandlers = function () {
    const elements = unique(sourceElements.concat(targetElements));

    elements.forEach(function (element) {
      element.removeEventListener(EVENTS.ELEMENT_DISABLED, disableHandler);
      element.addEventListener(EVENTS.ELEMENT_DISABLED, disableHandler);
    });
  };

  this.destroy = function () {
    const elements = unique(sourceElements.concat(targetElements));

    elements.forEach(function (element) {
      that.remove(element);
    });
  };
}

export default Synchronizer;
