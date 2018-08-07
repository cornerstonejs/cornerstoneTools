/* eslint class-methods-use-this: 0 */
/* eslint no-underscore-dangle: 0 */
import external from './../externalModules.js';
import baseTool from './../base/baseTool.js';
import {
  getToolState,
  removeToolState
} from './../stateManagement/toolState.js';
import { state } from './../store/index.js';

const cornerstone = external.cornerstone;

export default class extends baseTool {
  constructor (name = 'eraser') {
    super({
      name,
      supportedInteractionTypes: ['mouse', 'touch']
    });

    this.preMouseDownCallback = this._deleteAllNearbyTools.bind(this);
    this.preTouchStartCallback = this._deleteAllNearbyTools.bind(this);
  }

  _deleteAllNearbyTools (evt) {
    const coords = evt.detail.currentPoints.canvas;
    const element = evt.detail.element;

    state.tools.forEach(function (tool) {
      const toolState = getToolState(element, tool.name);

      if (toolState) {
        // Modifying in a foreach? Probably not ideal
        toolState.data.forEach(function (data) {
          if (
            typeof tool.pointNearTool === 'function' &&
            tool.pointNearTool(element, data, coords)
          ) {
            removeToolState(element, tool.name, data);
            cornerstone.updateImage(element);
          }
        });
      }
    });

    const consumeEvent = true;

    return consumeEvent;
  }
}
