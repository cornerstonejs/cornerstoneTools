import { path } from './drawing.js';

/**
 * @deprecated Use drawing.js:drawCircle()
 */
export default function (context, start, color, lineWidth) {
  const handleRadius = 6;

  path(context, { color,
    lineWidth }, (context) => {
    context.arc(start.x, start.y, handleRadius, 0, 2 * Math.PI);
  });
}
