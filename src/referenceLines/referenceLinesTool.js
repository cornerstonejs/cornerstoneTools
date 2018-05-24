import EVENTS from '../events.js';
import external from '../externalModules.js';
import { addToolState, getToolState } from '../stateManagement/toolState.js';
import renderActiveReferenceLine from './renderActiveReferenceLine.js';

const toolType = 'referenceLines';
let currentElement;

function onImageRendered (e) {
  const eventData = e.detail;

  // If we have no toolData for this element, return immediately as there is nothing to do
  const toolData = getToolState(e.currentTarget, toolType);

  if (toolData === undefined || toolData.data[0] === undefined) {
    return;
  }

  const renderer = toolData.data[0].renderer;

  // Create the canvas context and reset it to the pixel coordinate system
  const context = eventData.canvasContext.canvas.getContext('2d');

  external.cornerstone.setToPixelCoordinateSystem(eventData.enabledElement, context);

  // Render it
  renderer(context, eventData, e.currentTarget, currentElement);
}

// Enables the reference line tool for a given element.  Note that a custom renderer
// Can be provided if you want different rendering (e.g. all reference lines, first/last/active, etc)
function enable (element, synchronizationContext, activeElement, renderer) {
  renderer = renderer || renderActiveReferenceLine;

  currentElement = activeElement;
  addToolState(element, toolType, {
    synchronizationContext,
    renderer
  });

  element.removeEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);
  element.addEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);
  external.cornerstone.updateImage(element);
}

// Disables the reference line tool for the given element
function disable (element) {
  element.removeEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);
  external.cornerstone.updateImage(element);
}

// Module/private exports
const tool = {
  enable,
  disable
};

export default tool;
