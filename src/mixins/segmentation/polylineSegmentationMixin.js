import toolColors from '../../stateManagement/toolColors';
import { draw, drawJoinedLines, getNewContext } from '../../drawing';
import { getCursor } from '../../util/segmentation';

/**
 * Gets The cursor according to strategy.
 *
 * @protected
 * @abstract
 * @param  {string} toolName the name of the tool.
 * @param  {string} strategy the operation strategy.
 * @returns {MouseCursor}
 */
function _getCursor(toolName, strategy) {
  return getCursor(toolName, strategy);
}

/**
 * Render hook: draws the FreehandScissors's outline
 *
 * @param {Object} evt Cornerstone.event#cornerstoneimagerendered > cornerstoneimagerendered event
 * @memberof Tools.CorrectionTool
 * @returns {void}
 */
function renderToolData(evt) {
  const eventData = evt.detail;
  const { element } = eventData;
  const color = getters.brushColor(element, true);
  const context = getNewContext(eventData.canvasContext.canvas);
  const handles = this.handles;

  draw(context, context => {
    const isNotTheFirstHandle = handles.points.length > 1;

    if (isNotTheFirstHandle) {
      for (let j = 0; j < handles.points.length; j++) {
        const lines = [...handles.points[j].lines];

        drawJoinedLines(context, element, this.handles.points[j], lines, {
          color,
        });
      }
    }
  });
}

/**
 * @mixin polylineSegmentationMixin - segmentation operations for corrections Polyline
 * @memberof Mixins
 */
export default {
  _getCursor,
  renderToolData,
};
