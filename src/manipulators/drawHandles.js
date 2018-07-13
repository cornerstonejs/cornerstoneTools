import toolStyle from '../stateManagement/toolStyle.js';
import { drawCircle } from '../util/drawing.js';

const defaultHandleRadius = 6;

export default function (context, renderData, handles, color, options) {
  Object.keys(handles).forEach(function (name) {
    const handle = handles[name];

    if (handle.drawnIndependently === true) {
      return;
    }

    if (options && options.drawHandlesIfActive === true && !handle.active) {
      return;
    }

    const handleRadius = getHandleRadius(options);

    const circleOptions = {
      color,
      lineWidth: handle.active ? toolStyle.getActiveWidth() : toolStyle.getToolWidth(),
      fillStyle: options && options.fill
    };

    drawCircle(context, renderData.element, handle, handleRadius, circleOptions);
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
