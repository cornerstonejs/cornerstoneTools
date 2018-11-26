import external from './../externalModules.js';
import toolStyle from './../stateManagement/toolStyle.js';
import toolColors from './../stateManagement/toolColors.js';
import path from './path.js';
import { state } from './../store/index.js';

/**
 * Draws proivded handles to the provided context
 * @public
 * @method drawHandles
 * @memberof Drawing
 *
 * @param {CanvasRenderingContext2D} context - Target context
 * @param {*} evtDetail - Cornerstone's 'cornerstoneimagerendered' event's `detail`
 * @param {Object[]|Object} handles - An array of handle objects, or an object w/ named handle objects
 * @param {Object} [options={}] - Options object
 * @param {string} [options.color]
 * @param {Boolean} [options.drawHandlesIfActive=false] - Whether the handles should only be drawn if Active (hovered/selected)
 * @param {string} [options.fill]
 * @param {Number} [options.handleRadius=6]
 * @returns {undefined}
 */
export default function(context, evtDetail, handles, options = {}) {
  const element = evtDetail.element;
  const defaultColor = toolColors.getToolColor();

  context.strokeStyle = options.color || defaultColor;

  Object.keys(handles).forEach(function(name) {
    const handle = handles[name];

    if (handle.drawnIndependently === true) {
      return;
    }

    if (options.drawHandlesIfActive === true && !handle.active) {
      return;
    }

    const lineWidth = handle.active
      ? toolStyle.getActiveWidth()
      : toolStyle.getToolWidth();
    const fillStyle = options.fill;

    path(
      context,
      {
        lineWidth,
        fillStyle,
      },
      context => {
        const handleCanvasCoords = external.cornerstone.pixelToCanvas(
          element,
          handle
        );

        // Handle's radisu, then tool's radius, then default radius
        const handleRadius =
          handle.radius || options.handleRadius || state.handleRadius;

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
