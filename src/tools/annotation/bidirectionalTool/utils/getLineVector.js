export default function getLineVector(
  columnPixelSpacing,
  rowPixelSpacing,
  startPoint,
  endPoint
) {
  const dx = (startPoint.x - endPoint.x) * columnPixelSpacing;
  const dy = (startPoint.y - endPoint.y) * rowPixelSpacing;
  const length = Math.sqrt(dx * dx + dy * dy);
  const vectorX = dx / length;
  const vectorY = dy / length;

  return {
    x: vectorX,
    y: vectorY,
    length,
  };
}
