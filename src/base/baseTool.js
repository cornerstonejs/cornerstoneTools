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

  /**
   *
   *
   * @param {*} evt
   * @returns Any
   */
  applyActiveStrategy (evt) {
    return this.strategies[this.activeStrategy](evt, this.configuration);
  }

  //===================================================================
  // Optional Methods - Used to override default behavior.
  //===================================================================

  /**
   * Callback that takes priority if the tool is active, in case
   * any special behavior is required.
   *
   * @param  {type} evt
   * @return {boolean} stopImmediatePropagation - True if function consumed the event.
   */
  /*
  activeMouseDownCallback (evt) {
    // Implementation
    return stopImmediatePropagation;
  }
  */
}
