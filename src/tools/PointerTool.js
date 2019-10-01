import external from '../externalModules.js';
import BaseTool from './base/BaseTool.js';
import { getToolState } from '../stateManagement/toolState.js';
import { state } from '../store/index.js';
import { pointerCursor } from './cursors/index.js';
import triggerEvent from '../util/triggerEvent.js';
import EVENTS from '../events.js';

/**
 * @public
 * @class PointerTool
 * @memberof Tools
 *
 * @classdesc Tool for selecting annotations by activating them as well as events.
 * @extends Tools.Base.BaseTool
 */
export default class PointerTool extends BaseTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'Pointer',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      svgCursor: pointerCursor,
    };

    super(props, defaultProps);

    // Mode
    this.enabledCallback = this._disabledCallback.bind(this);
    this.disabledCallback = this._disabledCallback.bind(this);

    // Mouse
    this.preMouseDownCallback = this._nearbyTools.bind(this);
    // Touch
    this.preTouchStartCallback = this._nearbyTools.bind(this);
  }

  _nearbyTools(evt) {
    const coords = evt.detail.currentPoints.canvas;
    const element = evt.detail.element;

    state.tools.forEach(function(tool) {
      const toolState = getToolState(element, tool.name);

      if (toolState) {
        toolState.data.forEach(function(data, index) {
          const pointNearTool = tool.pointNearTool(element, data, coords);

          if (typeof tool.pointNearTool === 'function' && pointNearTool) {
            currentMeasurement = data;
            data.active = true;

            const eventType = EVENTS.POINTER;
            const eventData = {
              element,
              toolName: tool.name,
              measurementData: data,
              index,
            };

            triggerEvent(element, eventType, eventData);
          } else {
            data.active = false;
          }

          // Update Image
          external.cornerstone.updateImage(element);
        });
      }
    });

    return true;
  }

  _disabledCallback(element) {
    const enabledElement = external.cornerstone.getEnabledElement(element);

    if (enabledElement.image) {
      currentMeasurement.active = false;

      // Update Image
      external.cornerstone.updateImage(element);
    }
  }
}

let currentMeasurement = {};
