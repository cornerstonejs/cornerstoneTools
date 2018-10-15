import mixins from '../mixins/index.js';

/**
 * @export @abstract @class
 * @name BaseTool
 * @classdesc The fundemental abstract class from which all other tools inherit.
 */
export default class BaseTool {
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

    // Todo: should this live in baseTool?
    this.strategies = strategies || {};
    this.defaultStrategy =
      defaultStrategy || Object.keys(this.strategies)[0] || undefined;
    this.activeStrategy = this.defaultStrategy;

    //
    this.data = {};
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

  get configuration () {
    return this._configuration;
  }

  set configuration (configuration) {
    this._configuration = configuration;
  }

  // ToolOptions.js
  get options () {
    return this._options;
  }

  /**
   * Merges provided options with existing options
   *
   * @memberof BaseTool
   */
  mergeOptions (options) {
    this._options = Object.assign({}, this._options, options);
  }

  /**
   * Clears the tools options; preserves internal options, but
   * with `undefined` values.
   *
   * @memberof BaseTool
   */
  clearOptions () {
    this._options = {};
    this.internalOptions().forEach(
      (option) => (this._options[option] = undefined)
    );
  }

  /**
   * Internal options that "MUST" be in the tool's options if
   * certain conditions are met. Method is also good for inspecting
   * options that can be used to change tool behavior.
   *
   * @readonly
   * @memberof BaseTool
   */
  get internalOptions () {
    const internalOptions = [];

    // Should be on _every_ mouse tool
    if (this.supportedInteractionTypes.contains('Mouse')) {
      internalOptions.push('mouseButtonMask');
    }
    if (this.supportedInteractionTypes.contains('MultiTouch')) {
      internalOptions.push('touchPointers');
    }

    return internalOptions;
  }

  setDefaultStrategy() {
    this.activeStrategy = this.defaultStrategy;
  }

  /**
   *
   *
   * @param {*} evt
   * @returns Any
   */
  applyActiveStrategy (evt) {
    return this.strategies[this.activeStrategy](evt, this.configuration);
  }

  /**
   * Applys the requested mixins to the class.
   *
   * @param {string[]} mixinsArray An array of mixin identifiers (strings).
   */
  _applyMixins (mixinsArray) {
    for (let i = 0; i < mixinsArray.length; i++) {
      const mixin = mixins[`${mixinsArray[i]}`];

      console.log(mixinsArray[i]);

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

  /**
   * Callback that takes priority if the tool is active, before `MOUSE_DOWN`
   * events are processed. Does nothing by default.
   *
   * @virtual
   * @param  {type} evt
   * @return {boolean} consumedEvent - True if function consumed the event.
   */
  /**
   * Example implementation:
   *
   * preMouseDownCallback(evt) {
   *    return false;
   * }
   */

  /**
   * Callback that is called if the tool is active, after `MOUSE_DOWN`
   * events are processed. Does nothing by default.
   *
   * @virtual
   * @param  {type} evt
   * @return {boolean} consumedEvent - True if function consumed the event.
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
   * @return {boolean} consumedEvent - True if function consumed the event.
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
   * @return {boolean} consumedEvent - True if function consumed the event.
   */
  /**
   * Example implementation:
   *
   * postTouchStartCallback(evt) {
   *    return false;
   * }
   */
}
