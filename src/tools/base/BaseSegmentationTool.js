import BaseTool from './BaseTool.js';
import { setToolCursor } from '../../store/setToolCursor.js';
import external from '../../externalModules.js';

class BaseSegmentationTool extends BaseTool {
  constructor(props, defaultProps = {}) {
    // Important NOTE: this .push is needed on Base Classes to keep mixins coming from it's children
    defaultProps.mixins.push('segmentationAPI');
    super(props, defaultProps);

    //
    // Touch
    //
    /** @inheritdoc */
    this.postTouchStartCallback = this._startOutliningRegion.bind(this);

    /** @inheritdoc */
    this.touchDragCallback = this._setHandlesAndUpdate.bind(this);

    /** @inheritdoc */
    this.touchEndCallback = this._applyStrategy.bind(this);

    //
    // MOUSE
    //
    /** @inheritdoc */
    this.postMouseDownCallback = this._startOutliningRegion.bind(this);

    /** @inheritdoc */
    this.mouseClickCallback = this._startOutliningRegion.bind(this);

    /** @inheritdoc */
    this.mouseDragCallback = this._setHandlesAndUpdate.bind(this);

    /** @inheritdoc */
    this.mouseMoveCallback = this._setHandlesAndUpdate.bind(this);

    /** @inheritdoc */
    this.mouseUpCallback = this._applyStrategy.bind(this);

    this.changeStrategy = this.changeStrategy.bind(this);
    this._resetHandles();
  }

  // ===================================================================
  // Abstract Methods - Must be implemented.
  // ===================================================================

  /**
   * Gets The cursor according to strategy.
   *
   * @protected
   * @abstract
   * @param  {string} strategy the operation strategy.
   * @returns {MouseCursor}
   */
  // eslint-disable-next-line no-unused-vars
  _getCursor(strategy) {
    throw new Error(`Method _getCursor not implemented for ${this.name}.`);
  }

  /**
   * Sets the start handle point and claims the eventDispatcher event
   *
   * @private
   * @param {Object} evt // mousedown, touchstart, click
   * @returns {void|null}
   */
  _startOutliningRegion(evt) {
    throw new Error(
      `Method _startOutliningRegion not implemented for ${
        this.name
      }, you must use a segmentation mixin.`
    );
  }

  /**
   * This function will update the handles and updateImage to force re-draw
   *
   * @private
   * @method _setHandlesAndUpdate
   * @param {Object} evt  Interaction event emitted by an enabledElement
   * @returns {void}
   */
  _setHandlesAndUpdate(evt) {
    throw new Error(
      `Method _setHandlesAndUpdate not implemented for ${
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

    setToolCursor(element, this._getCursor(this.name, strategy));
    external.cornerstone.updateImage(element);
  }
}

export default BaseSegmentationTool;
