import { drawCircle } from './drawing.js';

/**
 * @deprecated Use drawing.js:drawCircle()
 */
export default function (context, start, color, lineWidth) {
  const handleRadius = 6;
  const options = {
    color,
    lineWidth
  };

  drawCircle(context, undefined, start, handleRadius, options, 'canvas');
}
