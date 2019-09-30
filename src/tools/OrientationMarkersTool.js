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
    const enabledElement = external.cornerstone.getEnabledElement(element);

    if (enabledElement.image) {
      external.cornerstone.updateImage(element);
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
    };

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
    if (this.configuration.drawAllMarkers) {
      drawTextBox(
        context,
        markers.right,
        coords.right.x - textWidths.right / 2,
        coords.right.y,
        color
      );
      drawTextBox(
        context,
        markers.bottom,
        coords.bottom.x - textWidths.bottom / 2,
        coords.bottom.y,
        color
      );
    }
  }
}

const getOrientationMarkers = element => {
  const cornerstone = external.cornerstone;
  const enabledElement = cornerstone.getEnabledElement(element);
  const imagePlaneMetaData = cornerstone.metaData.get(
    'imagePlaneModule',
    enabledElement.image.imageId
  );

  if (
    !imagePlaneMetaData ||
    !imagePlaneMetaData.rowCosines ||
    !imagePlaneMetaData.columnCosines
  ) {
    return;
  }

  const rowString = orientation.getOrientationString(
    imagePlaneMetaData.rowCosines
  );
  const columnString = orientation.getOrientationString(
    imagePlaneMetaData.columnCosines
  );

  const oppositeRowString = orientation.invertOrientationString(rowString);
  const oppositeColumnString = orientation.invertOrientationString(
    columnString
  );

  return {
    top: oppositeColumnString,
    bottom: columnString,
    left: oppositeRowString,
    right: rowString,
  };
};

const getOrientationMarkerPositions = element => {
  const cornerstone = external.cornerstone;
  const enabledElement = cornerstone.getEnabledElement(element);
  let coords;

  coords = {
    x: enabledElement.image.width / 2,
    y: 5,
  };
  const top = cornerstone.pixelToCanvas(element, coords);

  coords = {
    x: enabledElement.image.width / 2,
    y: enabledElement.image.height - 15,
  };
  const bottom = cornerstone.pixelToCanvas(element, coords);

  coords = {
    x: 5,
    y: enabledElement.image.height / 2,
  };
  const left = cornerstone.pixelToCanvas(element, coords);

  coords = {
    x: enabledElement.image.width - 10,
    y: enabledElement.image.height / 2,
  };
  const right = cornerstone.pixelToCanvas(element, coords);

  return {
    top,
    bottom,
    left,
    right,
  };
};
