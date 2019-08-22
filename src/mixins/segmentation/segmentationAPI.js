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
 * gets the active labelmap.
 * @returns {number}
 */
function getActiveLabelmap() {
  return getters.activeLabelmapIndex(this.element);
}

/**
 * Sets the active labelmap.
 * @param {number} labelMapIndex The index of the labelmap to set active.
 * @returns {null}
 */
function setActiveLabelmap(labelMapIndex = 0) {
  setters.activeLabelmap(this.element, labelMapIndex);
}

/**
 * Gets the fill alpha for the active labelmap.
 * @returns {number}
 */
function getFillAlpha() {
  return configuration.fillAlpha;
}
/**
 * Sets the fill alpha for the active labelmap.
 * @param  {number} value The alpha betwen 0 and 1.
 * @returns {null}
 */
function setFillAlpha(value) {
  configuration.fillAlpha = value;

  this._updateAllEnabledElements();
}

/**
 * Gets the fill alpha for inactive labelmaps.
 * @returns {number}
 */
function getFillAlphaInactive() {
  return configuration.fillAlphaInactive;
}

/**
 * Sets the fill alpha for inactive labelmaps.
 * @param  {number} value The alpha betwen 0 and 1.
 * @returns {null}
 */
function setFillAlphaInactive(value) {
  configuration.fillAlphaInactive = value;

  this._updateAllEnabledElements();
}

/**
 * Gets the outline alpha for the active labelmap.
 * @returns {number}
 */
function getOutlineAlpha() {
  return configuration.outlineAlpha;
}

/**
 * Sets the outline alpha for the active labelmap.
 * @param  {number} value The alpha betwen 0 and 1.
 * @returns {null}
 */
function setOutlineAlpha(value) {
  configuration.outlineAlpha = value;

  this._updateAllEnabledElements();
}

/**
 * Gets the outline alpha for inactive labelmaps.
 * @returns {number}
 */
function getOutlineAlphaInactive() {
  return configuration.outlineAlphaInactive;
}

/**
 * Sets the outline alpha for inactive labelmaps.
 * @param  {number} value The alpha betwen 0 and 1.
 * @returns {null}
 */
function setOutlineAlphaInactive(value) {
  configuration.outlineAlphaInactive = value;

  this._updateAllEnabledElements();
}

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
  // Getters
  getActiveLabelmap,
  getFillAlpha,
  getFillAlphaInactive,
  getOutlineAlpha,
  getOutlineAlphaInactive,

  // Setters
  setActiveLabelmap,
  setFillAlpha,
  setFillAlphaInactive,
  setOutlineAlpha,
  setOutlineAlphaInactive,

  nextSegment,
  previousSegment,

  // Helpers
  _updateAllEnabledElements,
};
