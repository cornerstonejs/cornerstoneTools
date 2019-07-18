import store from './../store/index.js';

const { setters, getters } = store.modules.brush;

// ===================================================================
// Segmentation API. This is effectively a wrapper around the store.
// ===================================================================

/**
 * gets the current segment color.
 * @returns {number}
 */
function getActiveLabelmap() {
  return getters.activeLabelmapIndex(this.element);
}

/**
 * Sets the current segment color.
 * @param {number} labelMapIndex the index to be set
 * @returns {void}
 */
function setActiveLabelmap(labelMapIndex = 0) {
  setters.activeLabelmap(this.element, labelMapIndex);
}

/**
 * Switches to the next segment color.
 * @returns {void}
 */
function nextSegment() {
  setters.incrementActiveSegmentIndex(this.element);
}

/**
 * Switches to the previous segmentation color.
 * @returns {void}
 */
function previousSegment() {
  setters.decrementActiveSegmentIndex(this.element);
}

/**
 * @mixin segmentationAPI - generic segmentation operations
 * @memberof Mixins
 */
export default {
  getActiveLabelmap,
  nextSegment,
  previousSegment,
  setActiveLabelmap,
};
