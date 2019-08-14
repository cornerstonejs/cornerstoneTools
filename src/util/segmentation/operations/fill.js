import {
  correction,
  fillInside,
  fillInsideBoundingBox,
  eraseInsideBoundingBox,
  fillOutside,
  eraseOutside,
  eraseOutsideCircle,
  eraseOutsideRectangle,
  eraseInside,
  fillOutsideRectangle,
  fillInsideCircle,
  eraseInsideCircle,
  fillOutsideCircle,
} from './index';
import { getLogger } from '../../logger';

const logger = getLogger('util:segmentation:operations:fill');

const operationList = {
  Circle: {
    FILL_INSIDE: evt => {
      fillInsideCircle(evt);
    },
    FILL_OUTSIDE: evt => {
      fillOutsideCircle(evt);
    },
    ERASE_OUTSIDE: evt => {
      eraseOutsideCircle(evt);
    },
    ERASE_INSIDE: evt => {
      eraseInsideCircle(evt);
    },
    default: evt => {
      fillInsideCircle(evt);
    },
  },
  Freehand: {
    FILL_INSIDE: evt => {
      fillInside(evt);
    },
    FILL_OUTSIDE: evt => {
      fillOutside(evt);
    },
    ERASE_OUTSIDE: evt => {
      eraseOutside(evt);
    },
    ERASE_INSIDE: evt => {
      eraseInside(evt);
    },
    default: evt => {
      fillInside(evt);
    },
  },
  Rectangle: {
    FILL_INSIDE: evt => {
      fillInsideBoundingBox(evt);
    },
    FILL_OUTSIDE: evt => {
      fillOutsideRectangle(evt);
    },
    ERASE_OUTSIDE: evt => {
      eraseOutsideRectangle(evt);
    },
    ERASE_INSIDE: evt => {
      eraseInsideBoundingBox(evt);
    },
    default: evt => {
      fillInsideBoundingBox(evt);
    },
  },
  Correction: {
    default: evt => {
      correction(evt);
    },
  },
};

export default (tool, strategy, evt) =>
  operationList[tool][strategy](evt) || null;
