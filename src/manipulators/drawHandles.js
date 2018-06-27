import external from '../externalModules.js';
import toolStyle from '../stateManagement/toolStyle.js';
import { path } from '../util/drawing.js';

const defaultHandleRadius = 6;

export default function (context, renderData, handles, color, options) {
  context.strokeStyle = color;

  Object.keys(handles).forEach(function (name) {
    const handle = handles[name];

    if (handle.drawnIndependently === true) {
      return;
    }

    if (options && options.drawHandlesIfActive === true && !handle.active) {
      return;
    }

    const lineWidth = handle.active ? toolStyle.getActiveWidth() : toolStyle.getToolWidth();
    const fillStyle = options && options.fill;

    path(context, { lineWidth,
      fillStyle }, (context) => {
      const handleCanvasCoords = external.cornerstone.pixelToCanvas(renderData.element, handle);

      const handleRadius = getHandleRadius(options);

      context.arc(handleCanvasCoords.x, handleCanvasCoords.y, handleRadius, 0, 2 * Math.PI);
    });
  });
}

function getHandleRadius (options) {
  let handleRadius;

  if (options && options.handleRadius) {
    handleRadius = options.handleRadius;
  } else {
    handleRadius = defaultHandleRadius;
  }

  return handleRadius;
}
