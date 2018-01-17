import EVENTS from '../events.js';
import external from '../externalModules.js';
import { addToolState, getToolState } from '../stateManagement/toolState.js';
import renderActiveReferenceLine from './renderActiveReferenceLine.js';

const toolType = 'referenceLines';

function onImageRendered (e) {
  const eventData = e.detail;

  // If we have no toolData for this element, return immediately as there is nothing to do
  const toolData = getToolState(e.currentTarget, toolType);

  if (toolData === undefined) {
    return;
  }

  // Get the enabled elements associated with this synchronization context and draw them
  const syncContext = toolData.data[0].synchronizationContext;
  const enabledElements = syncContext.getSourceElements();

  const renderer = toolData.data[0].renderer;

  // Create the canvas context and reset it to the pixel coordinate system
  const context = eventData.canvasContext.canvas.getContext('2d');

  external.cornerstone.setToPixelCoordinateSystem(eventData.enabledElement, context);

  // Iterate over each referenced element
  enabledElements.forEach((referenceEnabledElement) => {

    // Don't draw ourselves
    if (referenceEnabledElement === e.currentTarget) {
      return;
    }

    // Render it
    renderer(context, eventData, e.currentTarget, referenceEnabledElement);
  });
}

// Enables the reference line tool for a given element.  Note that a custom renderer
// Can be provided if you want different rendering (e.g. all reference lines, first/last/active, etc)
function enable (element, synchronizationContext, renderer) {
  renderer = renderer || renderActiveReferenceLine;

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
