import external from '../externalModules.js';
import BaseTool from './base/BaseTool.js';
import MouseCursor from '../util/MouseCursor.js';
import { clipToBox } from '../util/clip.js';
import zoomUtils from '../util/zoom/index.js';

const { correctShift, changeViewportScale } = zoomUtils;

/**
 * @public
 * @class ZoomTool
 * @memberof Tools
 *
 * @classdesc Tool for changing magnification.
 * @extends Tools.Base.BaseTool
 */
export default class ZoomTool extends BaseTool {
  constructor(configuration = {}) {
    const defaultConfig = {
      name: 'Zoom',
      strategies: {
        default: defaultStrategy,
        translate: translateStrategy,
        zoomToCenter: zoomToCenterStrategy,
      },
      defaultStrategy: 'default',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {
        invert: false,
        preventZoomOutsideImage: false,
        minScale: 0.25,
        maxScale: 20.0,
      },
    };
    const initialConfiguration = Object.assign(defaultConfig, configuration);

    super(initialConfiguration);

    this.initialConfiguration = initialConfiguration;

    this.configuration.svgCursor = this.configuration.svgCursor || zoomCursor;
  }

  touchDragCallback(evt) {
    dragCallback.call(this, evt);
  }

  mouseDragCallback(evt) {
    dragCallback.call(this, evt);
  }
}

const dragCallback = function(evt) {
  const deltaY = evt.detail.deltaPoints.page.y;

  if (!deltaY) {
    return false;
  }

  this.applyActiveStrategy(evt, this.configuration);
  external.cornerstone.setViewport(evt.detail.element, evt.detail.viewport);
};

/**
 * The default strategy keeps the target location fixed on the page
 * as we zoom in/out.
 *
 * @param {*} evt
 * @param {*} { invert, maxScale, minScale }
 * @returns {void}
 */
function defaultStrategy(evt, { invert, maxScale, minScale }) {
  const deltaY = evt.detail.deltaPoints.page.y;
  const ticks = invert ? -deltaY / 100 : deltaY / 100;
  const { element, viewport } = evt.detail;
  const [startX, startY, imageX, imageY] = [
    evt.detail.startPoints.page.x,
    evt.detail.startPoints.page.y,
    evt.detail.startPoints.image.x,
    evt.detail.startPoints.image.y,
  ];

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
  { invert, preventZoomOutsideImage, maxScale, minScale }
) {
  const deltaY = evt.detail.deltaPoints.page.y;
  const ticks = invert ? -deltaY / 100 : deltaY / 100;
  const image = evt.detail.image;
  const viewport = evt.detail.viewport;
  const [startX, startY] = [
    evt.detail.startPoints.image.x,
    evt.detail.startPoints.image.y,
  ];

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

function zoomToCenterStrategy(evt, { invert, maxScale, minScale }) {
  const deltaY = evt.detail.deltaPoints.page.y;
  const ticks = invert ? -deltaY / 100 : deltaY / 100;
  const viewport = evt.detail.viewport;

  // Calculate the new scale factor based on how far the mouse has changed
  changeViewportScale(viewport, ticks, {
    maxScale,
    minScale,
  });
}

const zoomCursor = new MouseCursor(
  `<svg
    data-icon="zoom" role="img" xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 512" width="40" height="32"
  >
    <path fill="#ffffff" d="M508.5 481.6l-129-129c-2.3-2.3-5.3-3.5-8.5-3.5h-10.3C395
      312 416 262.5 416 208 416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c54.5
      0 104-21 141.1-55.2V371c0 3.2 1.3 6.2 3.5 8.5l129 129c4.7 4.7 12.3 4.7 17
      0l9.9-9.9c4.7-4.7 4.7-12.3 0-17zM208 384c-97.3 0-176-78.7-176-176S110.7 32 208
      32s176 78.7 176 176-78.7 176-176 176z"
    />
    <path fill="#ffffff" transform="scale(0.22,0.22) translate(1400,0)" d="M1216
      320q0 26-19 45t-45 19h-128v1024h128q26 0 45 19t19 45-19 45l-256 256q-19
      19-45 19t-45-19l-256-256q-19-19-19-45t19-45 45-19h128v-1024h-128q-26
      0-45-19t-19-45 19-45l256-256q19-19 45-19t45 19l256 256q19 19 19 45z"
    />
  </svg>`,
  'topLeft'
);
