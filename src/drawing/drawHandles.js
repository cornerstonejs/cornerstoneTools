import external from '../externalModules.js';
import toolStyle from '../stateManagement/toolStyle.js';
import path from './path.js';

const defaultHandleRadius = 6;

/**
 * Draws proivded handles to the provided context
 * @public
 * @method drawHandles
 * @memberof Drawing
 *
 * @param {CanvasRenderingContext2D} context - Target context
 * @param {*} renderData - Cornerstone Tool's event detail
 * @param {Object[]} handles - An array of handle objects
 * @param {string} color - Handle color
 * @param {Object} [options] - Options object
 * @param {Boolean} [options.drawHandlesIfActive] - Whether the handles should only be drawn if Active (hovered/selected)
 * @returns {undefined}
 */
export default function(context, renderData, handles, color, options) {
  context.strokeStyle = color;

  Object.keys(handles).forEach(function(name) {
    const handle = handles[name];

    if (handle.drawnIndependently === true) {
      return;
    }

    if (options && options.drawHandlesIfActive === true && !handle.active) {
      return;
    }

    const lineWidth = handle.active
      ? toolStyle.getActiveWidth()
      : toolStyle.getToolWidth();
    const fillStyle = options && options.fill;

    path(
      context,
      {
        lineWidth,
        fillStyle,
      },
      context => {
        const handleCanvasCoords = external.cornerstone.pixelToCanvas(
          renderData.element,
          handle
        );

        const handleRadius = getHandleRadius(options);

        context.arc(
          handleCanvasCoords.x,
          handleCanvasCoords.y,
          handleRadius,
          0,
          2 * Math.PI
        );
      }
    );
  });
}

/**
 * Utility function to get the handleRadius
 * @private
 * @function getHandleRadius
 *
 * @param {Object} [options] - Options object
 * @param {Number} [options.handleRadius=6] - Handle radius to use
 * @returns {Number} handleRadius
 */
function getHandleRadius(options) {
  let handleRadius;

  if (options && options.handleRadius) {
    handleRadius = options.handleRadius;
  } else {
    handleRadius = defaultHandleRadius;
  }

  return handleRadius;
}
