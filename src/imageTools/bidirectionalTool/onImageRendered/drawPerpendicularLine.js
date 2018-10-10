import external from '../../../externalModules.js';

// Draw perpendicular line
export default function (context, element, data, color, lineWidth) {
  // Draw perpendicular line
  const { perpendicularStart, perpendicularEnd } = data.handles;
  const perpendicularStartCanvas = external.cornerstone.pixelToCanvas(element, perpendicularStart);
  const perpendicularEndCanvas = external.cornerstone.pixelToCanvas(element, perpendicularEnd);

  context.beginPath();
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  context.moveTo(perpendicularStartCanvas.x, perpendicularStartCanvas.y);
  context.lineTo(perpendicularEndCanvas.x, perpendicularEndCanvas.y);
  context.stroke();
}
