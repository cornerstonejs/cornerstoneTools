import displayTool from '../imageTools/displayTool.js';
import { getToolState } from '../stateManagement/toolState.js';
import { getNewContext, draw } from '../util/drawing.js';

/*
Display scroll progress bar across bottom of image.
 */
const scrollBarHeight = 6;

const configuration = {
  backgroundColor: 'rgb(19, 63, 141)',
  fillColor: 'white',
  orientation: 'horizontal'
};

function onImageRendered (e) {
  const eventData = e.detail;
  const element = eventData.element;
  const width = eventData.enabledElement.canvas.width;
  const height = eventData.enabledElement.canvas.height;

  if (!width || !height) {
    return false;
  }

  const context = getNewContext(eventData.enabledElement.canvas);

  draw(context, (context) => {
    const config = scrollIndicator.getConfiguration();

    // Draw indicator background
    context.fillStyle = config.backgroundColor;
    if (config.orientation === 'horizontal') {
      context.fillRect(0, height - scrollBarHeight, width, scrollBarHeight);
    } else {
      context.fillRect(0, 0, scrollBarHeight, height);
    }

    // Get current image index
    const stackData = getToolState(element, 'stack');

    if (stackData && stackData.data && stackData.data.length) {
      const imageIds = stackData.data[0].imageIds;
      const currentImageIdIndex = stackData.data[0].currentImageIdIndex;

      // Draw current image cursor
      const cursorWidth = width / imageIds.length;
      const cursorHeight = height / imageIds.length;
      const xPosition = cursorWidth * currentImageIdIndex;
      const yPosition = cursorHeight * currentImageIdIndex;

      context.fillStyle = config.fillColor;
      if (config.orientation === 'horizontal') {
        context.fillRect(xPosition, height - scrollBarHeight, cursorWidth, scrollBarHeight);
      } else {
        context.fillRect(0, yPosition, scrollBarHeight, cursorHeight);
      }
    }
  });
}

const scrollIndicator = displayTool(onImageRendered);

scrollIndicator.setConfiguration(configuration);

export default scrollIndicator;
