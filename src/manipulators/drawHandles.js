import { toolStyle } from '../index.js';
import { drawCircle } from '../util/drawing.js';

const defaultHandleRadius = 6;

export default function (context, element, handles, color, options) {
  Object.keys(handles).forEach(function (name) {
    const handle = handles[name];
    const { active, drawnIndependently } = handle;

    if (drawnIndependently || (options && options.drawHandlesIfActive === true && !active)) {
      return;
    }

    const circleOptions = {
      color,
      lineWidth: active ? toolStyle.getActiveWidth() : toolStyle.getToolWidth(),
      fillStyle: options && options.fill
    };

    const handleRadius = getHandleRadius(options);

    drawCircle(context, element, handle, handleRadius, circleOptions);
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
