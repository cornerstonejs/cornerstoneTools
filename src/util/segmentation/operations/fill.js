import {
  correction,
  fillInside,
  fillInsideBoundingBox,
  fillOutside,
  fillOutsideBoundingBox,
  fillInsideCircle,
  fillOutsideCircle,
} from './index';
import { getBoundingBoxAroundPolygon } from '../boundaries';

const operationList = {
  Circle: {
    FILL_INSIDE: (points, segmentationData, evt) => {
      fillInsideCircle(points, segmentationData, evt, 1);
    },
    FILL_OUTSIDE: (points, segmentationData, evt) => {
      fillOutsideCircle(points, segmentationData, evt, 1);
    },
    ERASE_OUTSIDE: (points, segmentationData, evt) => {
      fillOutsideCircle(points, segmentationData, evt, 0);
    },
    ERASE_INSIDE: (points, segmentationData, evt) => {
      fillInsideCircle(points, segmentationData, evt, 0);
    },
    default: (points, segmentationData, evt) => {
      fillInsideCircle(points, segmentationData, evt, 1);
    },
  },
  Freehand: {
    FILL_INSIDE: (points, segmentationData, evt) => {
      fillInside(points, segmentationData, evt, 1);
    },
    FILL_OUTSIDE: (points, segmentationData, evt) => {
      fillOutside(points, segmentationData, evt, 1);
    },
    ERASE_OUTSIDE: (points, segmentationData, evt) => {
      fillOutside(points, segmentationData, evt, 0);
    },
    ERASE_INSIDE: (points, segmentationData, evt) => {
      fillInside(points, segmentationData, evt, 0);
    },
    default: (points, segmentationData, evt) => {
      fillInside(points, segmentationData, evt, 1);
    },
  },
  Rectangle: {
    FILL_INSIDE: (points, segmentationData, evt) => {
      fillInsideBoundingBox(points, segmentationData, evt, 1);
    },
    FILL_OUTSIDE: (points, segmentationData, evt) => {
      const vertices = points.map(a => [a.x, a.y]);
      const [topLeft, bottomRight] = getBoundingBoxAroundPolygon(
        vertices,
        evt.detail.image
      );

      fillOutsideBoundingBox(topLeft, bottomRight, segmentationData, evt, 1);
    },
    ERASE_OUTSIDE: (points, segmentationData, evt) => {
      const vertices = points.map(a => [a.x, a.y]);
      const [topLeft, bottomRight] = getBoundingBoxAroundPolygon(
        vertices,
        evt.detail.image
      );

      fillOutsideBoundingBox(topLeft, bottomRight, segmentationData, evt, 0);
    },
    ERASE_INSIDE: (points, segmentationData, evt) => {
      fillInsideBoundingBox(points, segmentationData, evt, 0);
    },
    default: (points, segmentationData, evt) => {
      fillInsideBoundingBox(points, segmentationData, evt, 1);
    },
  },
  Correction: {
    default: (points, segmentationData, evt) => {
      correction(points, segmentationData, evt);
    },
  },
};

export default (tool, strategy, evt) => {
  const { points, segmentationData } = evt.OperationData;

  return operationList[tool][strategy](points, segmentationData, evt) || null;
};
