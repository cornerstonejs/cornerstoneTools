import {
  freehandEraseInsideCursor,
  freehandEraseOutsideCursor,
  freehandFillInsideCursor,
  freehandFillOutsideCursor,
  segCircleEraseInsideCursor,
  segCircleEraseOutsideCursor,
  segCircleFillInsideCursor,
  segCircleFillOutsideCursor,
  segRectangleEraseInsideCursor,
  segRectangleEraseOutsideCursor,
  segRectangleFillInsideCursor,
  segRectangleFillOutsideCursor,
} from '../../tools/cursors';

const cursorList = {
  FreehandScissors: {
    FILL_INSIDE: freehandFillInsideCursor,
    FILL_OUTSIDE: freehandFillOutsideCursor,
    ERASE_OUTSIDE: freehandEraseOutsideCursor,
    ERASE_INSIDE: freehandEraseInsideCursor,
    default: freehandFillInsideCursor,
  },
  RectangleScissors: {
    FILL_INSIDE: segRectangleFillInsideCursor,
    FILL_OUTSIDE: segRectangleEraseOutsideCursor,
    ERASE_OUTSIDE: segRectangleFillOutsideCursor,
    ERASE_INSIDE: segRectangleEraseInsideCursor,
    default: segRectangleFillInsideCursor,
  },
  CircleScissors: {
    FILL_INSIDE: segCircleFillInsideCursor,
    FILL_OUTSIDE: segCircleFillOutsideCursor,
    ERASE_OUTSIDE: segCircleEraseOutsideCursor,
    ERASE_INSIDE: segCircleEraseInsideCursor,
    default: segCircleFillInsideCursor,
  },
};

/**
 * Gets one of the default Scissors cursors available on the `cursorList`
 * @param  {string} toolName          The tool name prefix.
 * @param  {string} strategy          The operation strategy suffix.
 * @returns {MouseCursor}
 */
const getCursor = (toolName, strategy) =>
  cursorList[toolName][strategy] || cursorList[0][0];

export default getCursor;
