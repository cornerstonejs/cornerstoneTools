import external from '../externalModules.js';
import { drawJoinedLines, drawLine } from './drawing.js';


export default function (context, element, start, end, headLength, color) {
  const cornerstone = external.cornerstone;

  start = cornerstone.pixelToCanvas(element, start);
  end = cornerstone.pixelToCanvas(element, end);

  const angle = Math.atan2(end.y - start.y, end.x - start.x);

  const points = [
    {
      x: end.x - headLength * Math.cos(angle - Math.PI / 7),
      y: end.y - headLength * Math.sin(angle - Math.PI / 7)
    },
    {
      x: end.x - headLength * Math.cos(angle + Math.PI / 7),
      y: end.y - headLength * Math.sin(angle + Math.PI / 7)
    },
    end
  ];

  // Draw the arrow line
  drawLine(context, element, start, end, { color });

  // Draw the arrow head
  const options = {
    color,
    fillStyle: color
  };

  drawJoinedLines(context, element, end, points, options);
}
