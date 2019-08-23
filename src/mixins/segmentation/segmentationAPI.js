import store from '../../store/index.js';
import external from '../../externalModules.js';

const { setters, getters, configuration } = store.modules.segmentation;

const elements = store.state.enabledElements;

// ===================================================================
// Segmentation API. This is effectively a wrapper around the store,
// But does some useful stuff like force an update on each element
// when the segmentation fillAlpha is changed.
// ===================================================================

/**
 * Switches to the next segment color.
 * @returns {null}
 */
function nextSegment() {
  setters.incrementActiveSegmentIndex(this.element);
}

/**
 * Switches to the previous segmentation color.
 * @returns {null}
 */
function previousSegment() {
  setters.decrementActiveSegmentIndex(this.element);
}

/**
 * Update all enabled elements.
 * @returns {null}
 */
function _updateAllEnabledElements() {
  elements.forEach(element => {
    external.cornerstone.updateImage(element);
  });
}

/**
 * @mixin segmentationAPI - generic segmentation operations
 * @memberof Mixins
 */
export default {
  nextSegment,
  previousSegment,

  // Helpers
  _updateAllEnabledElements,
};
