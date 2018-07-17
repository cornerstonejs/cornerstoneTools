import { drawEllipse } from './drawing.js';

// http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas

/**
 * @deprecated Use drawing.js:drawEllipse()
 */
export default function (context, x, y, w, h) {

  const corner1 = {
    x,
    y
  };
  const corner2 = {
    x: x + w,
    y: y + h
  };

  drawEllipse(context, undefined, corner1, corner2, {}, 'canvas');
}
