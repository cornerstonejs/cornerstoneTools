import external from '../externalModules.js';
import BaseTool from './base/BaseTool.js';
import orientation from '../orientation/index.js';

// Drawing
import { getNewContext } from '../drawing/index.js';
import toolColors from '../stateManagement/toolColors.js';
import drawTextBox, { textBoxWidth } from '../drawing/drawTextBox.js';

/**
 * @public
 * @class OrientationMarkersTool
 * @memberof Tools
 *
 * @classdesc Tool for displaying orientation markers on the image.
 * @extends Tools.Base.BaseTool
 */
export default class OrientationMarkersTool extends BaseTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'OrientationMarkers',
      configuration: {
        drawAllMarkers: true,
      },
      mixins: ['enabledOrDisabledBinaryTool'],
    };

    super(props, defaultProps);
  }

  enabledCallback(element) {
    this.forceImageUpdate(element);
  }

  disabledCallback(element) {
    this.forceImageUpdate(element);
  }

  forceImageUpdate(element) {
    const cornerstone = external.cornerstone;
    const enabledElement = cornerstone.getEnabledElement(element);

    if (enabledElement.image) {
      cornerstone.updateImage(element);
    }
  }

  renderToolData(evt) {
    const eventData = evt.detail;
    const context = getNewContext(eventData.canvasContext.canvas);
    const element = eventData.element;
    const markers = getOrientationMarkers(element);

    if (!markers) {
      return;
    }
    const coords = getOrientationMarkerPositions(element, markers);
    const color = toolColors.getToolColor();

    const textWidths = {
      top: textBoxWidth(context, markers.top, 0),
      left: textBoxWidth(context, markers.left, 0),
      right: textBoxWidth(context, markers.right, 0),
      bottom: textBoxWidth(context, markers.bottom, 0),
      height: textBoxWidth(context, 'M', 0), // Trick to get an approximation of the height of the text
    };

    drawTopLeftText(context, markers, coords, textWidths, color);
    if (this.configuration.drawAllMarkers) {
      drawBottomRightText(context, markers, coords, textWidths, color);
    }
  }
}

const drawTopLeftText = (context, markers, coords, textWidths, color) => {
  drawTextBox(
    context,
    markers.top,
    coords.top.x - textWidths.top / 2,
    coords.top.y,
    color
  );
  drawTextBox(
    context,
    markers.left,
    coords.left.x - textWidths.left / 2,
    coords.left.y,
    color
  );
};

const drawBottomRightText = (context, markers, coords, textWidths, color) => {
  drawTextBox(
    context,
    markers.right,
    coords.right.x - textWidths.right,
    coords.right.y,
    color
  );
  drawTextBox(
    context,
    markers.bottom,
    coords.bottom.x - textWidths.bottom / 2,
    coords.bottom.y - textWidths.height,
    color
  );
};

const getOrientationMarkers = element => {
  const cornerstone = external.cornerstone;
  const enabledElement = cornerstone.getEnabledElement(element);
  const imagePlane = cornerstone.metaData.get(
    'imagePlaneModule',
    enabledElement.image.imageId
  );

  if (!imagePlane || !imagePlane.rowCosines || !imagePlane.columnCosines) {
    return;
  }

  const row = orientation.getOrientationString(imagePlane.rowCosines);
  const column = orientation.getOrientationString(imagePlane.columnCosines);
  const oppositeRow = orientation.invertOrientationString(row);
  const oppositeColumn = orientation.invertOrientationString(column);

  return {
    top: oppositeColumn,
    bottom: column,
    left: oppositeRow,
    right: row,
  };
};

const getOrientationMarkerPositions = element => {
  const enabledElement = external.cornerstone.getEnabledElement(element);
  const top = external.cornerstone.pixelToCanvas(element, {
    x: enabledElement.image.width / 2,
    y: 5,
  });
  const bottom = external.cornerstone.pixelToCanvas(element, {
    x: enabledElement.image.width / 2,
    y: enabledElement.image.height - 15,
  });
  const left = external.cornerstone.pixelToCanvas(element, {
    x: 5,
    y: enabledElement.image.height / 2,
  });
  const right = external.cornerstone.pixelToCanvas(element, {
    x: enabledElement.image.width - 10,
    y: enabledElement.image.height / 2,
  });

  return {
    top,
    bottom,
    left,
    right,
  };
};
