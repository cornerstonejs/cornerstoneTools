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
 * @classdesc Tool for deleting the data of other Annotation Tools.
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

    this.preMouseDownCallback = this._nearbyTools.bind(this);
    this.preTouchStartCallback = this._nearbyTools.bind(this);
  }

  _nearbyTools(evt) {
    const coords = evt.detail.currentPoints.canvas;
    const element = evt.detail.element;

    state.tools.forEach(function(tool) {
      const toolState = getToolState(element, tool.name);

      if (toolState) {
        // Modifying in a foreach? Probably not ideal
        toolState.data.forEach(function(data, index) {
          if (
            typeof tool.pointNearTool === 'function' &&
            tool.pointNearTool(element, data, coords)
          ) {
            const eventType = EVENTS.POINTER;
            const eventData = {
              element,
              toolName: tool.name,
              measurementData: data,
              index,
            };

            triggerEvent(element, eventType, eventData);
          }
        });
      }
    });

    const consumeEvent = true;

    return consumeEvent;
  }
}
