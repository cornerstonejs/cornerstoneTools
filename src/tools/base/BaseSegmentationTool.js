import BaseTool from './BaseTool.js';
import { setToolCursor } from '../../store/setToolCursor.js';
import external from '../../externalModules.js';

class BaseSegmentationTool extends BaseTool {
  constructor(props, defaultProps = {}) {
    // Important NOTE: this .push is needed on Base Classes to keep mixins coming from it's children
    defaultProps.mixins.push('segmentationAPI');
    super(props, defaultProps);

    // If the mixin has an initalisation step, call it.
    if (typeof this.initializeSegmentationMixin === 'function') {
      this.initializeSegmentationMixin();
    }

    this._cursors = Object.assign({}, defaultProps.cursors, props.cursors);
  }

  // ===================================================================
  // Abstract Methods - Must be implemented.
  // ===================================================================

  /**
   * Applies the active segmentation strategy.
   *
   * @protected
   * @abstract
   * @param {Object} evt
   * @returns {void}
   */
  _applyStrategy(evt) {
    throw new Error(
      `Method _applyStrategy not implemented for ${
        this.name
      }, you must use a segmentation mixin.`
    );
  }

  // ===================================================================
  // Virtual Methods - Have default behavior but may be overridden.
  // ===================================================================

  /**
   * This function changes the current Strategy
   *
   * @public
   * @param {string} strategy - The strategy string.
   * @returns {void}
   */
  changeStrategy(strategy = 'default') {
    this.setActiveStrategy(strategy);
    setTimeout(() => {
      this.changeCursor(this.element, strategy);
    }, 50);
    this._resetHandles();
  }

  /**
   * Function responsible for changing the Cursor, according to the strategy.
   * @param {HTMLElement} element
   * @param {string} strategy The strategy to be used on Tool
   * @public
   * @returns {void}
   */
  changeCursor(element, strategy) {
    // Necessary to avoid setToolCursor call without elements, which throws an error.
    if (!element) {
      return;
    }

    const cursor = this._getCursor(strategy);

    this.svgCursor = cursor;

    if (this.mode === 'active') {
      setToolCursor(element, cursor);
      external.cornerstone.updateImage(element);
    }
  }

  // ===================================================================
  // Implementation interface
  // ===================================================================

  /**
   * Returns the cursor for the given strategy name.
   * @param  {string} strategy
   */
  _getCursor(strategy) {
    return this._cursors[strategy];
  }
}

export default BaseSegmentationTool;
