import getCircleCoords from '../../getCircleCoords';

export default function getBoundingBoxAroundCircle(evt) {
  const { handles } = evt.detail;
  const { width, height } = evt.detail.image;
  const circleCoordinates = getCircleCoords(handles.start, handles.end);

  let xMax = circleCoordinates.width + circleCoordinates.left;
  let xMin = circleCoordinates.left;
  let yMax = circleCoordinates.top + circleCoordinates.height;
  let yMin = circleCoordinates.top;

  xMin = Math.round(xMin);
  yMin = Math.round(yMin);
  xMax = Math.round(xMax);
  yMax = Math.round(yMax);

  xMax = Math.min(width, xMax);
  xMin = Math.max(0, xMin);
  yMax = Math.min(height, yMax);
  yMin = Math.max(0, yMin);

  return [[xMin, yMin], [xMax, yMax]];
}
