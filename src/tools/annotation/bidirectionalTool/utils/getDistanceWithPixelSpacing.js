export default function getDistanceWithPixelSpacing(
  columnPixelSpacing,
  rowPixelSpacing,
  pointA,
  pointB
) {
  const calcX = (pointA.x - pointB.x) / rowPixelSpacing;
  const calcY = (pointA.y - pointB.y) / columnPixelSpacing;

  return Math.sqrt(calcX * calcX + calcY * calcY);
}
