import external from '../externalModules.js';
import BaseTool from './base/BaseTool.js';
import {clipToBox} from '../util/clip.js';
import zoomUtils from '../util/zoom/index.js';
import {zoomCursor} from './cursors/index.js';
import getImageFitScale from '../util/getImageFitScale.js';

const {correctShift, changeViewportScale} = zoomUtils;

/**
 * @public
 * @class ZoomTool
 * @memberof Tools
 *
 * @classdesc Tool for changing magnification.
 * @extends Tools.Base.BaseTool
 */
export default class ZoomTool extends BaseTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'Zoom',
      strategies: {
        default: defaultStrategy,
        translate: translateStrategy,
        zoomToCenter: zoomToCenterStrategy,
      },
      defaultStrategy: 'default',
      supportedInteractionTypes: ['Mouse', 'MouseWheel', 'Touch', 'Keyboard'],
      configuration: {
        invert: false,
        preventZoomOutsideImage: false,
        minScaleKey: [189, 109], // -
        maxScaleKey: [187, 107], // +
        resetKey: [82] //resize
      },
      svgCursor: zoomCursor,
    };

    super (props, defaultProps);
  }

  touchDragCallback (evt) {
    dragCallback.call (this, evt);
  }

  mouseDragCallback (evt) {
    dragCallback.call (this, evt);
  }

  preMouseDownActivateCallback(evt) {
    dragCallback.call (this, evt);
  }

  mouseWheelCallback(evt) {
    const { direction: images } = evt.detail;
    const { invert } = this.configuration;
    const direction = invert ? -images : images;
    if (!(evt.detail.detail.ctrlKey || evt.detail.detail.metaKey)) {
      return;
    }
    if (direction > 0) {
      keyBoardCallBack.call (
        this,
        evt,
        0.0615
      );
    } else {
      keyBoardCallBack.call (
        this,
        evt,
        -0.0615
      );
    }
  }

  keyboardCallBack(evt) {
    const { element } = evt.detail;
    const { maxScaleKey, minScaleKey, resetKey } = this.configuration;
    if (resetKey.indexOf(evt.detail.keyCode) >=0) {
      external.cornerstone.resetPanZoom(element);
    }
    if ( maxScaleKey.indexOf(evt.detail.keyCode) >=0 ) {
      keyBoardCallBack.call (
        this,
        evt,
        0.0615
      );
    } else if (minScaleKey.indexOf(evt.detail.keyCode) >=0 ) {
      keyBoardCallBack.call (
        this,
        evt,
        -0.0615
      );
    }
  }
}

const keyBoardCallBack = function (evt, step) {
  // Calculate the new scale factor based on how far the mouse has changed
  const { element } = evt.detail;
  const minScale = defaultMinScale(evt);
  const maxScale = minScale * 15
  const viewport = external.cornerstone.getViewport(element)
  const updatedViewport = changeViewportScale (viewport, step, {
    maxScale,
    minScale,
  });
  external.cornerstone.setViewport (element, updatedViewport);
};

const dragCallback = function (evt) {
  if (!evt.detail.deltaPoints.page) {
    return false;
  }
  const deltaY = evt.detail.deltaPoints.page.y;

  if (!deltaY) {
    return false;
  }

  this.applyActiveStrategy (evt, this.configuration);
  external.cornerstone.setViewport (
    evt.detail.element,
    evt.detail.viewport,
    false
  );
};

/**
 * The default scale keeps the target filled the container
 * as we zoom in/out.
 *
 * @param {*} evt
 * @param {*} { invert, maxScale, minScale }
 * @returns {void}
 */

function defaultMinScale(evt) { 
  const { element } = evt.detail;
  const enabledElement = external.cornerstone.getEnabledElement(element);
  const scale = getImageFitScale(enabledElement.canvas, enabledElement.image, enabledElement.viewport.rotation).scaleFactor;
  return scale;
}

/**
 * The default strategy keeps the target location fixed on the page
 * as we zoom in/out.
 *
 * @param {*} evt
 * @param {*} { invert }
 * @returns {void}
 */
function defaultStrategy(evt, { invert }) {
  const deltaY = evt.detail.deltaPoints.page.y;
  const ticks = invert ? deltaY / 100 : -deltaY / 100;
  const { element, viewport } = evt.detail;
  const [startX, startY, imageX, imageY] = [
    evt.detail.startPoints.page.x,
    evt.detail.startPoints.page.y,
    evt.detail.startPoints.image.x,
    evt.detail.startPoints.image.y,
  ];

  const minScale = defaultMinScale(evt);
  const maxScale = minScale * 15;

  // Calculate the new scale factor based on how far the mouse has changed
  const updatedViewport = changeViewportScale(viewport, ticks, {
    maxScale,
    minScale,
  });

  external.cornerstone.setViewport(element, updatedViewport);

  // Now that the scale has been updated, determine the offset we need to apply to the center so we can
  // Keep the original start location in the same position
  const newCoords = external.cornerstone.pageToPixel(element, startX, startY);

  // The shift we will use is the difference between the original image coordinates of the point we've selected
  // And the image coordinates of the same point on the page after the viewport scaling above has been performed
  // This shift is in image coordinates, and is designed to keep the target location fixed on the page.
  let shift = {
    x: imageX - newCoords.x,
    y: imageY - newCoords.y,
  };

  // Correct the required shift using the viewport rotation and flip parameters
  shift = correctShift(shift, updatedViewport);

  // Apply the shift to the Viewport's translation setting
  viewport.translation.x -= shift.x;
  viewport.translation.y -= shift.y;
}

function translateStrategy(
  evt,
  { invert, preventZoomOutsideImage }
) {
  const deltaY = evt.detail.deltaPoints.page.y;
  const ticks = invert ? deltaY / 100 : -deltaY / 100;
  const image = evt.detail.image;
  const viewport = evt.detail.viewport;
  const [startX, startY] = [
    evt.detail.startPoints.image.x,
    evt.detail.startPoints.image.y,
  ];

  const minScale = defaultMinScale(evt);
  const maxScale = minScale * 15;

  // Calculate the new scale factor based on how far the mouse has changed
  // Note that in this case we don't need to update the viewport after the initial
  // Zoom step since we aren't don't intend to keep the target position static on
  // The page
  const updatedViewport = changeViewportScale(viewport, ticks, {
    maxScale,
    minScale,
  });

  // Define the default shift to take place during this zoom step
  const shift = {
    x: 0,
    y: 0,
  };

  // Define the parameters for the translate strategy
  const translateSpeed = 8;
  const outwardsMinScaleToTranslate = 3;
  const minTranslation = 0.01;

  if (ticks < 0) {
    // Zoom outwards from the image center
    if (updatedViewport.scale < outwardsMinScaleToTranslate) {
      // If the current translation is smaller than the minimum desired translation,
      // Set the translation to zero
      if (Math.abs(updatedViewport.translation.x) < minTranslation) {
        updatedViewport.translation.x = 0;
      } else {
        shift.x = updatedViewport.translation.x / translateSpeed;
      }

      // If the current translation is smaller than the minimum desired translation,
      // Set the translation to zero
      if (Math.abs(updatedViewport.translation.y) < minTranslation) {
        updatedViewport.translation.y = 0;
      } else {
        shift.y = updatedViewport.translation.y / translateSpeed;
      }
    }
  } else {
    // Zoom inwards to the current image point

    // Identify the coordinates of the point the user is trying to zoom into
    // If we are not allowed to zoom outside the image, bound the user-selected position to
    // A point inside the image
    if (preventZoomOutsideImage) {
      clipToBox(evt.detail.startPoints.image, image);
    }

    // Calculate the translation value that would place the desired image point in the center
    // Of the viewport
    let desiredTranslation = {
      x: image.width / 2 - startX,
      y: image.height / 2 - startY,
    };

    // Correct the target location using the viewport rotation and flip parameters
    desiredTranslation = correctShift(desiredTranslation, updatedViewport);

    // Calculate the difference between the current viewport translation value and the
    // Final desired translation values
    const distanceToDesired = {
      x: updatedViewport.translation.x - desiredTranslation.x,
      y: updatedViewport.translation.y - desiredTranslation.y,
    };

    // If the current translation is smaller than the minimum desired translation,
    // Stop translating in the x-direction
    if (Math.abs(distanceToDesired.x) < minTranslation) {
      updatedViewport.translation.x = desiredTranslation.x;
    } else {
      // Otherwise, shift the viewport by one step
      shift.x = distanceToDesired.x / translateSpeed;
    }

    // If the current translation is smaller than the minimum desired translation,
    // Stop translating in the y-direction
    if (Math.abs(distanceToDesired.y) < minTranslation) {
      updatedViewport.translation.y = desiredTranslation.y;
    } else {
      // Otherwise, shift the viewport by one step
      shift.y = distanceToDesired.y / translateSpeed;
    }
  }

  // Apply the shift to the Viewport's translation setting
  updatedViewport.translation.x -= shift.x;
  updatedViewport.translation.y -= shift.y;
}
function zoomToCenterStrategy (evt, {invert}) {
  const deltaY = evt.detail.deltaPoints.page.y;
  const ticks = invert ? deltaY / 100 : - deltaY / 100;
  const viewport = evt.detail.viewport;

  const minScale = defaultMinScale(evt);
  const maxScale = minScale * 15

  // Calculate the new scale factor based on how far the mouse has changed
  changeViewportScale (viewport, ticks, {
    maxScale,
    minScale,
  });
}
