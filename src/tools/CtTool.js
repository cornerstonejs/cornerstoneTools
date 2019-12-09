import { CtCalculator } from '@sk/dicom-parser';
import external from '../externalModules.js';
import BaseTool from './base/BaseTool.js';
import EVENTS from '../events.js';
import triggerEvent from '../util/triggerEvent.js';

/**
 * @public
 * @class CtTool
 * @memberof Tools
 *
 * @classdesc Tool for setting ct by dragging with mouse/touch.
 * @extends Tools.Base.BaseTool
 */
export default class CtTool extends BaseTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'CT',
      strategies: { basicLevelingStrategy },
      supportedInteractionTypes: ['MouseMove'],
    };

    super(props, defaultProps);
    this.lastCtValue = 0;
  }

  mouseMoveCallback(evt) {
    const eventData = evt.detail;
    const { element, image, currentPoints } = eventData;
    const imageX = currentPoints.image.x;
    const imageY = currentPoints.image.y;
    const { rows, columns } = image;
    if (imageX < 0 || imageX > columns || imageY < 0 || imageY > rows) {
      if (this.lastCtValue !== 0) {
        triggerEvent(element, EVENTS.CT_VALUE_UPDATE, 0);
      }
      this.lastCtValue = 0;
      return;
    }
    this.lastCtValue = this.applyActiveStrategy(evt); 
  }
}

/**
 * Here we normalize the ct adjustments so the same number of on screen pixels
 * adjusts the same percentage of the dynamic range of the image.  This is needed to
 * provide consistency for the ct tool regardless of the dynamic range (e.g. an 8 bit
 * image will feel the same as a 16 bit image would)
 *
 * @param {Object} evt
 * @returns {void}
 */
function basicLevelingStrategy(evt) {
  const eventData = evt.detail;
  const { element, image, currentPoints } = eventData;
  const imageX = currentPoints.image.x;
  const imageY = currentPoints.image.y;
  const offsetX = Math.round(imageX);
  const offsetY = Math.round(imageY);
  const ct = CtCalculator.getCurrentCTValue(image.getDicom(), offsetY * image.width + offsetX);
  triggerEvent(element, EVENTS.CT_VALUE_UPDATE, ct);
  return ct;
}
  