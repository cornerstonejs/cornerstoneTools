import { draw, drawJoinedLines, getNewContext } from '../../drawing';
import { getModule } from '../../store';
import freehandSegmentationMixin from './freehandSegmentationMixin';

const { getters } = getModule('segmentation');

/**
 * Override for `freehandSegmentationMixin`'s `renderToolData` method to render a polyline instead
 * of a freehand region with the first and last point connected. Apply after the `freehandSegmentationMixin`.
 *
 * @override
 * @param {Object} evt The cornerstone render event.
 * @returns {null}
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

const polylineSegmentationMixin = Object.assign({}, freehandSegmentationMixin, {
  renderToolData,
});

/**
 * @mixin freehandPolylineRenderOverride - segmentation operations for corrections Polyline
 * @memberof Mixins
 */
export default polylineSegmentationMixin;
