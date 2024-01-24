/* eslint no-loop-func: 0 */ // --> OFF
import drawHandles from './../../../drawing/drawHandles.js';
import updatePerpendicularLineHandles from './utils/updatePerpendicularLineHandles.js';
import { getModule } from '../../../store/index';

import toolStyle from './../../../stateManagement/toolStyle.js';
import toolColors from './../../../stateManagement/toolColors.js';
import { getToolState } from './../../../stateManagement/toolState.js';
import {
  getNewContext,
  draw,
  setShadow,
  drawLine,
} from './../../../drawing/index.js';
import drawLinkedTextBox from './../../../drawing/drawLinkedTextBox.js';
import getPixelSpacing from '../../../util/pixelSpacing/getPixelSpacing';

export default function(evt) {
  const eventData = evt.detail;
  const { element, canvasContext, image } = eventData;
  const {
    handleRadius,
    drawHandlesOnHover,
    hideHandlesIfMoving,
    renderDashed,
  } = this.configuration;

  const lineDash = getModule('globalConfiguration').configuration.lineDash;

  // If we have no toolData for this element, return immediately as there is nothing to do
  const toolData = getToolState(element, this.name);

  if (!toolData) {
    return;
  }

  const { rowPixelSpacing, colPixelSpacing } = getPixelSpacing(image);

  // LT-29 Disable Target Measurements when pixel spacing is not available
  if (!rowPixelSpacing || !colPixelSpacing) {
    return;
  }

  // We have tool data for this element - iterate over each one and draw it
  const context = getNewContext(canvasContext.canvas);

  let color;
  const lineWidth = toolStyle.getToolWidth();

  for (let i = 0; i < toolData.data.length; i++) {
    const data = toolData.data[i];

    if (data.visible === false) {
      continue;
    }

    color = toolColors.getColorIfActive(data);

    // Calculate the data measurements
    if (data.invalidated === true) {
      if (data.longestDiameter && data.shortestDiameter) {
        this.throttledUpdateCachedStats(image, element, data);
      } else {
        this.updateCachedStats(image, element, data);
      }
    }

    draw(context, context => {
      // Configurable shadow
      setShadow(context, this.configuration);

      const {
        start,
        end,
        perpendicularStart,
        perpendicularEnd,
        textBox,
      } = data.handles;

      const lineOptions = { color };
      const perpendicularLineOptions = { color, strokeWidth };

      if (renderDashed) {
        lineOptions.lineDash = lineDash;
        perpendicularLineOptions.lineDash = lineDash;
      }

      // Draw the measurement line
      drawLine(context, element, start, end, lineOptions);

      // Draw perpendicular line
      const strokeWidth = lineWidth;

      updatePerpendicularLineHandles(eventData, data);

      drawLine(
        context,
        element,
        perpendicularStart,
        perpendicularEnd,
        perpendicularLineOptions
      );

      // Draw the handles
      const handleOptions = {
        color,
        handleRadius,
        drawHandlesIfActive: drawHandlesOnHover,
        hideHandlesIfMoving,
      };

      // Draw the handles
      if (this.configuration.drawHandles) {
        drawHandles(context, eventData, data.handles, handleOptions);
      }

      // Draw the textbox
      // Move the textbox slightly to the right and upwards
      // So that it sits beside the length tool handle
      const xOffset = 10;
      const textBoxAnchorPoints = handles => [
        handles.start,
        handles.end,
        handles.perpendicularStart,
        handles.perpendicularEnd,
      ];
      const textLines = getTextBoxText(data, rowPixelSpacing, colPixelSpacing);

      drawLinkedTextBox(
        context,
        element,
        textBox,
        textLines,
        data.handles,
        textBoxAnchorPoints,
        color,
        lineWidth,
        xOffset,
        true
      );
    });
  }
}

const getTextBoxText = (data, rowPixelSpacing, colPixelSpacing) => {
  let suffix = ' mm';

  if (!rowPixelSpacing || !colPixelSpacing) {
    suffix = ' pixels';
  }

  const lengthText = ` L ${data.longestDiameter}${suffix}`;
  const widthText = ` W ${data.shortestDiameter}${suffix}`;

  const { labels } = data;

  if (labels && Array.isArray(labels)) {
    return [...labels, lengthText, widthText];
  }

  return [lengthText, widthText];
};
