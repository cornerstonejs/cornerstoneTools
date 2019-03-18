import BaseTool from './base/BaseTool.js';
import external from './../externalModules.js';
import MouseCursor from '../util/MouseCursor.js';

import loadHandlerManager from '../stateManagement/loadHandlerManager.js';
import {
  addToolState,
  getToolState,
  clearToolState,
} from '../stateManagement/toolState.js';
import { imagePointToPatientPoint } from '../util/pointProjector.js';
import convertToVector3 from '../util/convertToVector3.js';
import { setToolOptions } from '../toolOptions.js';

/**
 * @public
 * @class CrosshairsTool
 * @memberof Tools
 *
 * @classdesc Tool for finding the slice in another element corresponding to the
 * image position in a synchronized image series.
 * @extends Tools.Base.BaseTool
 */
export default class CrosshairsTool extends BaseTool {
  constructor(configuration = {}) {
    const defaultConfig = {
      name: 'Crosshairs',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {
        svgCursor: crosshairsCursor,
      },
    };
    const initialConfiguration = Object.assign(defaultConfig, configuration);

    super(initialConfiguration);

    this.initialConfiguration = initialConfiguration;

    this.mouseDownCallback = this._chooseLocation.bind(this);
    this.mouseDragCallback = this._chooseLocation.bind(this);
    this.touchDragCallback = this._chooseLocation.bind(this);
  }

  _chooseLocation(evt) {
    const eventData = evt.detail;
    const { element } = eventData;

    // Prevent CornerstoneToolsTouchStartActive from killing any press events
    evt.stopImmediatePropagation();

    // If we have no toolData for this element, return immediately as there is nothing to do
    const toolData = getToolState(element, this.name);

    if (!toolData) {
      return;
    }

    // Get current element target information
    const sourceElement = element;
    const sourceEnabledElement = external.cornerstone.getEnabledElement(
      sourceElement
    );
    const sourceImageId = sourceEnabledElement.image.imageId;
    const sourceImagePlane = external.cornerstone.metaData.get(
      'imagePlaneModule',
      sourceImageId
    );

    if (!sourceImagePlane) {
      return;
    }

    // Get currentPoints from mouse cursor on selected element
    const sourceImagePoint = eventData.currentPoints.image;

    // Transfer this to a patientPoint given imagePlane metadata
    const patientPoint = imagePointToPatientPoint(
      sourceImagePoint,
      sourceImagePlane
    );

    // Get the enabled elements associated with this synchronization context
    const syncContext = toolData.data[0].synchronizationContext;
    const enabledElements = syncContext.getSourceElements();

    // Iterate over each synchronized element
    enabledElements.forEach(function(targetElement) {
      // Don't do anything if the target is the same as the source
      if (targetElement === sourceElement) {
        return;
      }

      let minDistance = Number.MAX_VALUE;
      let newImageIdIndex = -1;

      const stackToolDataSource = getToolState(targetElement, 'stack');

      if (stackToolDataSource === undefined) {
        return;
      }

      const stackData = stackToolDataSource.data[0];

      // Find within the element's stack the closest image plane to selected location
      stackData.imageIds.forEach(function(imageId, index) {
        const imagePlane = external.cornerstone.metaData.get(
          'imagePlaneModule',
          imageId
        );

        // Skip if the image plane is not ready
        if (
          !imagePlane ||
          !imagePlane.imagePositionPatient ||
          !imagePlane.rowCosines ||
          !imagePlane.columnCosines
        ) {
          return;
        }

        const imagePosition = convertToVector3(imagePlane.imagePositionPatient);
        const row = convertToVector3(imagePlane.rowCosines);
        const column = convertToVector3(imagePlane.columnCosines);
        const normal = column.clone().cross(row.clone());
        const distance = Math.abs(
          normal.clone().dot(imagePosition) - normal.clone().dot(patientPoint)
        );

        if (distance < minDistance) {
          minDistance = distance;
          newImageIdIndex = index;
        }
      });

      if (newImageIdIndex === stackData.currentImageIdIndex) {
        return;
      }

      // Switch the loaded image to the required image
      if (
        newImageIdIndex !== -1 &&
        stackData.imageIds[newImageIdIndex] !== undefined
      ) {
        const startLoadingHandler = loadHandlerManager.getStartLoadHandler();
        const endLoadingHandler = loadHandlerManager.getEndLoadHandler();
        const errorLoadingHandler = loadHandlerManager.getErrorLoadingHandler();

        if (startLoadingHandler) {
          startLoadingHandler(targetElement);
        }

        let loader;

        if (stackData.preventCache === true) {
          loader = external.cornerstone.loadImage(
            stackData.imageIds[newImageIdIndex]
          );
        } else {
          loader = external.cornerstone.loadAndCacheImage(
            stackData.imageIds[newImageIdIndex]
          );
        }

        loader.then(
          function(image) {
            const viewport = external.cornerstone.getViewport(targetElement);

            stackData.currentImageIdIndex = newImageIdIndex;
            external.cornerstone.displayImage(targetElement, image, viewport);
            if (endLoadingHandler) {
              endLoadingHandler(targetElement, image);
            }
          },
          function(error) {
            const imageId = stackData.imageIds[newImageIdIndex];

            if (errorLoadingHandler) {
              errorLoadingHandler(targetElement, imageId, error);
            }
          }
        );
      }
    });
  }

  activeCallback(element, { mouseButtonMask, synchronizationContext }) {
    setToolOptions(this.name, element, { mouseButtonMask });

    // Clear any currently existing toolData
    clearToolState(element, this.name);

    addToolState(element, this.name, {
      synchronizationContext,
    });
  }
}

const crosshairsCursor = new MouseCursor(
  `<svg
    data-icon="crosshairs" role="img" xmlns="http://www.w3.org/2000/svg"
    width="32" height="32" viewBox="0 0 1792 1792"
  >
    <path fill="#ffffff" d="M1325 1024h-109q-26 0-45-19t-19-45v-128q0-26
      19-45t45-19h109q-32-108-112.5-188.5t-188.5-112.5v109q0 26-19 45t-45
      19h-128q-26 0-45-19t-19-45v-109q-108 32-188.5 112.5t-112.5 188.5h109q26
      0 45 19t19 45v128q0 26-19 45t-45 19h-109q32 108 112.5 188.5t188.5
      112.5v-109q0-26 19-45t45-19h128q26 0 45 19t19 45v109q108-32
      188.5-112.5t112.5-188.5zm339-192v128q0 26-19 45t-45 19h-143q-37 161-154.5
      278.5t-278.5 154.5v143q0 26-19 45t-45 19h-128q-26
      0-45-19t-19-45v-143q-161-37-278.5-154.5t-154.5-278.5h-143q-26
      0-45-19t-19-45v-128q0-26 19-45t45-19h143q37-161
      154.5-278.5t278.5-154.5v-143q0-26 19-45t45-19h128q26 0 45 19t19 45v143q161
      37 278.5 154.5t154.5 278.5h143q26 0 45 19t19 45z"
    />
  </svg>`
);
