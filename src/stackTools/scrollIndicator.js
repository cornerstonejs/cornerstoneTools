import displayTool from '../imageTools/displayTool.js';
import { getToolState } from '../stateManagement/toolState.js';
import { getNewContext, draw, fillBox } from '../util/drawing.js';

/*
Display scroll progress bar across bottom of image.
 */
const scrollBarSize = 6;

const configuration = {
  backgroundColor: 'rgb(19, 63, 141)',
  fillColor: 'white',
  orientation: 'horizontal'
};

function drawScrollBar (context, element, canvas, size, offset, horizontal, N, i, backgroundColor, fillColor) {
  if (!canvas.width || !canvas.height) {
    return;
  }

  const boundingBox = {
    left: horizontal ? offset : 0,
    top: horizontal ? 0 : offset,
    width: size,
    height: size
  };

  // Draw indicator background
  if (horizontal) {
    boundingBox.width = canvas.width;
  } else {
    boundingBox.height = canvas.height;
  }
  fillBox(context, boundingBox, backgroundColor);

  if (N !== undefined && i !== undefined) {
    // Draw current image cursor
    if (horizontal) {
      const cursorWidth = canvas.width / N;

      boundingBox.width = cursorWidth;
      boundingBox.left += i * cursorWidth;
    } else {
      const cursorHeight = canvas.width / N;

      boundingBox.height = cursorHeight;
      boundingBox.top += i * cursorHeight;
    }
    fillBox(context, boundingBox, fillColor);
  }
}

function onImageRendered (e) {
  const eventData = e.detail;
  const element = eventData.element;

  const config = scrollIndicator.getConfiguration();
  const horizontal = config.orientation === 'horizontal';

  // Get current image index
  let N;
  let i;
  const stackData = getToolState(element, 'stack');

  if (stackData && stackData.data && stackData.data.length) {
    N = stackData.data[0].imageIds.length;
    i = stackData.data[0].currentImageIdIndex;
  }
  // Shift indicator down by scrollBarSize when horizontal
  const offset = horizontal ? scrollBarSize : 0;
  const context = getNewContext(eventData.canvasContext.canvas);

  draw(context, (context) => {
    drawScrollBar(context, element, eventData.canvasContext.canvas, scrollBarSize,
      offset, horizontal, N, i, config.backgroundColor, config.fillColor);
  });
}

const scrollIndicator = displayTool(onImageRendered);

scrollIndicator.setConfiguration(configuration);

export default scrollIndicator;
