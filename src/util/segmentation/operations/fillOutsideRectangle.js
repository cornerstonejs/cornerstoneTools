import { getBoundingBoxAroundPolygon } from '../boundaries';
import { fillOutsideBoundingBox } from './index';

export default function fillOutsideRectangle(evt) {
  const eventData = evt.detail;
  const { operationData } = evt;
  const { points } = operationData;

  const { image } = eventData;

  const vertices = points.map(a => [a.x, a.y]);
  const [topLeft, bottomRight] = getBoundingBoxAroundPolygon(vertices, image);

  fillOutsideBoundingBox(evt, topLeft, bottomRight);
}
