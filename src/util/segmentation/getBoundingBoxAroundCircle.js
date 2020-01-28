import getCircleCoords from '../getCircleCoords';

export default function getBoundingBoxAroundCircle(evt) {
  const { handles } = evt.detail;
  const { width: imageWidth, height: imageHeight } = evt.detail.image;
  const circleCoordinates = getCircleCoords(handles.start, handles.end);

  let xMax = circleCoordinates.width + circleCoordinates.left;
  let xMin = circleCoordinates.left;
  let yMax = circleCoordinates.top + circleCoordinates.height;
  let yMin = circleCoordinates.top;

  xMin = Math.floor(xMin);
  yMin = Math.floor(yMin);
  xMax = Math.floor(xMax);
  yMax = Math.floor(yMax);

  xMax = Math.min(imageWidth, xMax);
  xMin = Math.max(0, xMin);
  yMax = Math.min(imageHeight, yMax);
  yMin = Math.max(0, yMin);

  return [[xMin, yMin], [xMax, yMax]];
}
