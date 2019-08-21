import store from './../store/index.js';
import external from '../externalModules.js';

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
 * @param {number} labelMapIndex the index of the labelmap to set active.
 * @returns {null}
 */
function setActiveLabelmap(labelMapIndex = 0) {
  setters.activeLabelmap(this.element, labelMapIndex);
}

function getFillAlpha() {
  return configuration.fillAlpha;
}

function setFillAlpha(value) {
  configuration.fillAlpha = value;

  this._updateAllEnabledElements();
}

function getFillAlphaInactive() {
  return configuration.fillAlphaInactive;
}

function setFillAlphaInactive(value) {
  configuration.fillAlphaInactive = value;

  this._updateAllEnabledElements();
}

function getOutlineAlpha() {
  return configuration.outlineAlpha;
}

function setOutlineAlpha(value) {
  configuration.outlineAlpha = value;

  this._updateAllEnabledElements();
}

function getOutlineAlphaInactive() {
  return configuration.outlineAlphaInactive;
}

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
