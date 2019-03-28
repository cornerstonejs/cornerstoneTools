/* eslint no-loop-func: 0 */ // --> OFF
import external from './../../../externalModules.js';
import drawHandles from './../../../drawing/drawHandles.js';
import updatePerpendicularLineHandles from './utils/updatePerpendicularLineHandles.js';
import calculateLongestAndShortestDiameters from './utils/calculateLongestAndShortestDiameters.js';

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

export default function(evt) {
  const eventData = evt.detail;
  const { element, canvasContext, image } = eventData;
  const { handleRadius, drawHandlesOnHover } = this.configuration;

  // If we have no toolData for this element, return immediately as there is nothing to do
  const toolData = getToolState(element, this.name);

  if (!toolData) {
    return;
  }

  const imagePlane = external.cornerstone.metaData.get(
    'imagePlaneModule',
    image.imageId
  );

  let rowPixelSpacing = image.rowPixelSpacing;
  let colPixelSpacing = image.columnPixelSpacing;

  if (imagePlane) {
    rowPixelSpacing =
      imagePlane.rowPixelSpacing || imagePlane.rowImagePixelSpacing;
    colPixelSpacing =
      imagePlane.columnPixelSpacing || imagePlane.colImagePixelSpacing;
  }

  // LT-29 Disable Target Measurements when pixel spacing is not available
  if (!rowPixelSpacing || !colPixelSpacing) {
    return;
  }

  // We have tool data for this element - iterate over each one and draw it
  const context = getNewContext(canvasContext.canvas);

  let color;
  const activeColor = toolColors.getActiveColor();
  const lineWidth = toolStyle.getToolWidth();

  for (let i = 0; i < toolData.data.length; i++) {
    const data = toolData.data[i];

    if (data.visible === false) {
      continue;
    }

    color = data.active ? activeColor : toolColors.getToolColor();

    // Calculate the data measurements
    calculateLongestAndShortestDiameters(eventData, data);

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

      // Draw the measurement line
      drawLine(context, element, start, end, { color });

      // Draw perpendicular line
      const strokeWidth = lineWidth;

      updatePerpendicularLineHandles(eventData, data);
      drawLine(context, element, perpendicularStart, perpendicularEnd, {
        color,
        strokeWidth,
      });

      // Draw the handles
      const handleOptions = {
        color,
        handleRadius,
        drawHandlesIfActive: drawHandlesOnHover,
      };

      // Draw the handles
      drawHandles(context, eventData, data.handles, handleOptions);

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
