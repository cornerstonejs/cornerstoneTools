import external from '../externalModules.js';
import BaseTool from './base/BaseTool.js';
import { getToolState, removeToolState } from '../stateManagement/toolState.js';
import { state } from '../store/index.js';
import { eraserCursor } from './cursors/index.js';

/**
 * @public
 * @class EraserTool
 * @memberof Tools
 *
 * @classdesc Tool for deleting the data of other Annotation Tools.
 * @extends Tools.Base.BaseTool
 */
export default class EraserTool extends BaseTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'Eraser',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      svgCursor: eraserCursor,
    };

    super(props, defaultProps);

    this.preMouseDownCallback = this._deleteAllNearbyTools.bind(this);
    this.preTouchStartCallback = this._deleteAllNearbyTools.bind(this);
  }

  _deleteAllNearbyTools(evt) {
    const coords = evt.detail.currentPoints.canvas;
    const element = evt.detail.element;

    state.tools.forEach(function(tool) {
      const toolState = getToolState(element, tool.name);

      if (toolState) {
        // Modifying in a foreach? Probably not ideal
        toolState.data.forEach(function(data) {
          if (
            typeof tool.pointNearTool === 'function' &&
            tool.pointNearTool(element, data, coords)
          ) {
            removeToolState(element, tool.name, data);
            external.cornerstone.updateImage(element);
          }
        });
      }
    });

    const consumeEvent = true;

    return consumeEvent;
  }
}
