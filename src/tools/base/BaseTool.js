import mixins from './../../mixins/index.js';

/**
 * @interface
 * @class BaseTool
 * @memberof Tools.Base
 *
 * @classdesc The fundemental abstract class from which all other tools inherit.
 * @property {String} activeStrategy The name of the strategy that should be used
 * @property {String} defaultStrategy The initial `activeStrategy` when the tool was initialized
 * @property {CornerstoneTools.ToolMode} mode 1 of 4 modes that influence the tool's behavior
 * @property {String} name A descriptive, unique tool name
 * @property {Object} strategies An object containing available tool strategies
 * @property {Array} supportedInteractionTypes
 */
export default class BaseTool {

  /**
   *Creates an instance of BaseTool.
   * @param {*} [{
   *     name,
   *     strategies,
   *     defaultStrategy,
   *     configuration,
   *     supportedInteractionTypes,
   *     mixins
   *   }={}]
   * @memberof BaseTool
   */
  constructor ({
    name,
    strategies,
    defaultStrategy,
    configuration,
    supportedInteractionTypes,
    mixins
  } = {}) {
    this.name = name;
    this.mode = 'disabled';
    this.element = undefined;
    this.supportedInteractionTypes = supportedInteractionTypes || [];

    this.strategies = strategies || {};
    this.defaultStrategy =
      defaultStrategy || Object.keys(this.strategies)[0] || undefined;
    this.activeStrategy = this.defaultStrategy;

    // Options are set when a tool is added, during a "mode" change,
    // Or via a tool's option's setter
    this._options = {};
    // Configuration is set at tool initalization
    this._configuration = Object.assign({}, configuration);

    // True if tool has a custom cursor, causes the frame to render on every mouse move when the tool is active.
    this.hasCursor = false;

    // Apply mixins if mixinsArray is not empty.
    if (mixins && mixins.length) {
      this._applyMixins(mixins);
    }
  }

  //
  // CONFIGURATION
  //

  /**
   *
   *
   * @memberof BaseTool
   */
  get configuration () {
    return this._configuration;
  }

  /**
   *
   *
   * @memberof BaseTool
   */
  set configuration (configuration) {
    this._configuration = configuration;
  }

  //
  // OPTIONS
  //

  /**
   * @readonly
   * @memberof BaseTool
   */
  get options () {
    return this._options;
  }

  /**
   * Merges provided options with existing options.
   *
   * @public
   * @memberof BaseTool
   * @param {Object} options - options object to merge with existing options.
   * @returns {undefined}
   */
  mergeOptions (options) {
    this._options = Object.assign({}, this._options, options);
  }

  /**
   * Clears the tools options.
   *
   * @public
   * @memberof BaseTool
   * @returns {undefined}
   */
  clearOptions () {
    this._options = {};
  }

  /**
   * Apply the currently set/active strategy.
   *
   * @public
   * @memberof BaseTool
   * @method applyActiveStrategy
   * @param {*} evt The event that triggered the strategies application
   * @returns {*} strategies vary widely; check each specific strategy to find expected return value
   */
  applyActiveStrategy (evt) {
    return this.strategies[this.activeStrategy](evt, this.configuration);
  }

  /**
   * Iterates over registered mixins; any matching names in the provided `mixinsArray` will
   * be merged with this instance.
   *
   * @private
   * @memberof BaseTool
   * @method _applyMixins
   * @param {string[]} mixinsArray An array of mixin identifiers (strings).
   * @returns {undefined}
   */
  _applyMixins (mixinsArray) {
    for (let i = 0; i < mixinsArray.length; i++) {
      const mixin = mixins[`${mixinsArray[i]}`];

      if (typeof mixin === 'object') {
        Object.assign(this, mixin);
      } else {
        console.warn(`${this.name}: mixin ${mixins[i]} does not exist.`);
      }
    }
  }

  // ===================================================================
  // Virtual Methods - Have default behavior but may be overriden.
  // ===================================================================

  //
  // MOUSE
  //

  /**
   * Callback that takes priority if the tool is active, before `MOUSE_DOWN`
   * events are processed. Does nothing by default.
   *
   * @callback BaseTool~preMouseDownCallback
   * @param  {CornerstoneTools.event:cornerstonetoolsmousedown} evt
   * @returns {boolean} consumedEvent - True if function consumed the event.
   */
  /**
   * Callback that takes priority if the tool is active, after `MOUSE_DOWN`
   * events are processed. Does nothing by default.
   *
   * @callback BaseTool~postMouseDownCallback
   * @param  {CornerstoneTools.event:cornerstonetoolsmousedown} evt
   * @returns {boolean} consumedEvent - True if function consumed the event.
   */

  /**
   * Callback that is called if the tool is active, after `MOUSE_DOWN`
   * events are processed. Does nothing by default.
   *
   * @virtual
   * @param  {type} evt
   * @returns {boolean} consumedEvent - True if function consumed the event.
   */
  /**
   * Example implementation:
   *
   * postMouseDownCallback(evt) {
   *    return false;
   * }
   */

  /**
   * Callback that takes priority if the tool is active, before `TOUCH_START`
   * events are processed. Does nothing by default.
   *
   * @virtual
   * @param  {type} evt
   * @returns {boolean} consumedEvent - True if function consumed the event.
   */
  /**
   * Example implementation:
   *
   * preTouchStartCallback(evt) {
   *    return false;
   * }
   */

  /**
   * Callback that is called if the tool is active, after `TOUCH_START`
   * events are processed. Does nothing by default.
   *
   * @virtual
   * @param  {type} evt
   * @returns {boolean} consumedEvent - True if function consumed the event.
   */
  /**
   * Example implementation:
   *
   * postTouchStartCallback(evt) {
   *    return false;
   * }
   */
}
