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
import { getLogger } from '../../logger';

const logger = getLogger('util:segmentation:operations:fill');

const operationList = {
  Circle: {
    FILL_INSIDE: evt => {
      fillInsideCircle(evt);
    },
    // TODO
    FILL_OUTSIDE: (points, segmentationData, evt) => {
      fillOutsideCircle(points, segmentationData, evt, 1);
    },
    // TODO
    ERASE_OUTSIDE: (points, segmentationData, evt) => {
      fillOutsideCircle(points, segmentationData, evt, 0);
    },
    // TODO
    ERASE_INSIDE: (points, segmentationData, evt) => {
      fillInsideCircle(points, segmentationData, evt, 0);
    },
    // TODO
    default: (points, segmentationData, evt) => {
      fillInsideCircle(points, segmentationData, evt, 1);
    },
  },
  Freehand: {
    FILL_INSIDE: evt => {
      fillInside(evt);
    },
    // TODO
    FILL_OUTSIDE: (points, segmentationData, evt) => {
      fillOutside(points, segmentationData, evt, 1);
    },
    // TODO
    ERASE_OUTSIDE: (points, segmentationData, evt) => {
      fillOutside(points, segmentationData, evt, 0);
    },
    // TODO
    ERASE_INSIDE: (points, segmentationData, evt) => {
      fillInside(points, segmentationData, evt, 0);
    },
    // TODO
    default: (points, segmentationData, evt) => {
      fillInside(points, segmentationData, evt, 1);
    },
  },
  Rectangle: {
    FILL_INSIDE: evt => {
      fillInsideBoundingBox(evt);
    },
    // TODO
    FILL_OUTSIDE: (points, segmentationData, evt) => {
      const vertices = points.map(a => [a.x, a.y]);
      const [topLeft, bottomRight] = getBoundingBoxAroundPolygon(
        vertices,
        evt.detail.image
      );

      fillOutsideBoundingBox(topLeft, bottomRight, segmentationData, evt, 1);
    },
    // TODO
    ERASE_OUTSIDE: (points, segmentationData, evt) => {
      const vertices = points.map(a => [a.x, a.y]);
      const [topLeft, bottomRight] = getBoundingBoxAroundPolygon(
        vertices,
        evt.detail.image
      );

      fillOutsideBoundingBox(topLeft, bottomRight, segmentationData, evt, 0);
    },
    // TODO
    ERASE_INSIDE: (points, segmentationData, evt) => {
      fillInsideBoundingBox(points, segmentationData, evt, 0);
    },
    // TODO
    default: (points, segmentationData, evt) => {
      fillInsideBoundingBox(points, segmentationData, evt, 1);
    },
  },
  Correction: {
    // TODO
    default: evt => {
      correction(evt);
    },
  },
};

export default (tool, strategy, evt) => {
  return operationList[tool][strategy](evt) || null;
};
