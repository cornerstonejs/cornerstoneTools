import { getBoundingBoxAroundPolygon } from '../boundaries';
import { eraseOutsideBoundingBox } from './index';

export default function eraseOutsideRectangle(evt) {
  const eventData = evt.detail;
  const { operationData } = evt;
  const { points } = operationData;

  const { image } = eventData;

  const vertices = points.map(a => [a.x, a.y]);
  const [topLeft, bottomRight] = getBoundingBoxAroundPolygon(vertices, image);

  eraseOutsideBoundingBox(evt, topLeft, bottomRight);
}
