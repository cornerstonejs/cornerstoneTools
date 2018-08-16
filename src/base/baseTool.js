import external from './../externalModules.js';
import KeyboardController from '../fancy-tools/shared/KeyboardController.js';
import isToolActive from '../fancy-tools/shared/isToolActive.js';

export default class {
  constructor ({
    name,
    strategies,
    defaultStrategy,
    configuration,
    supportedInteractionTypes
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
    this._options = {};
    this._configuration = Object.assign({}, configuration);

    // True if tool has a custom cursor, causes the frame to render on every mouse move when the tool is active.
    this.hasCursor = false;

    // Setup keybinds if present.
    const keyBinds = this.configuration.keyBinds;

    if (keyBinds) {
      this.activateKeyBinds(keyBinds);
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

  set options (options) {
    this._options = options;
  }

  clearOptions () {
    this._options = {};
  }

  activateKeyBinds (keyBinds) {
    this._keyboardController = new KeyboardController(this, keyBinds);
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
  * Event handler for KEY_DOWN event.
  *
  * @event
  * @param {Object} evt - The event.
  */
  onKeyDown (evt) {
    const eventData = evt.detail;
    const element = eventData.element;

    if (!isToolActive(element, this.name) || !this._keyboardController) {
      return;
    }

    const keyCode = eventData.keyCode;
    const imageNeedsUpdate = this._keyboardController.keyPress(keyCode);

    if (imageNeedsUpdate) {
      external.cornerstone.updateImage(element);
    }
  }

  // ===================================================================
  // Virtual Methods - Have default behavior but may be overriden.
  // ===================================================================

  /**
   * Callback that takes priority if the tool is active, in case
   * any special behavior is required. Does nothing by default.
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
   * Callback that takes priority if the tool is active, in case
   * any special behavior is required. Does nothing by default.
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
   * Callback that takes priority if the tool is active, in case
   * any special behavior is required. Does nothing by default.
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
   * Callback that takes priority if the tool is active, in case
   * any special behavior is required. Does nothing by default.
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
