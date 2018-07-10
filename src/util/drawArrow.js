import { path } from './drawing.js';

export default function (context, start, end, color, lineWidth) {
  // Variables to be used when creating the arrow
  const headLength = 10;

  const angle = Math.atan2(end.y - start.y, end.x - start.x);

  // Starting path of the arrow from the start square to the end square and drawing the stroke
  path(context, { color,
    lineWidth }, (context) => {
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
  });

  const fillStyle = color;

  path(context, { color,
    lineWidth,
    fillStyle }, (context) => {
    // Starting a new path from the head of the arrow to one of the sides of the point
    context.moveTo(end.x, end.y);
    context.lineTo(end.x - headLength * Math.cos(angle - Math.PI / 7), end.y - headLength * Math.sin(angle - Math.PI / 7));

    // Path from the side point of the arrow, to the other side point
    context.lineTo(end.x - headLength * Math.cos(angle + Math.PI / 7), end.y - headLength * Math.sin(angle + Math.PI / 7));

    // Path from the side point back to the tip of the arrow, and then again to the opposite side point
    context.lineTo(end.x, end.y);
    context.lineTo(end.x - headLength * Math.cos(angle - Math.PI / 7), end.y - headLength * Math.sin(angle - Math.PI / 7));
  });
}
