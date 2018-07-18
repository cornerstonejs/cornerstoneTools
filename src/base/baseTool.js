export default class {
  constructor ({ name, strategies, defaultStrategy, configuration }) {
    this.name = name;
    this.mode = 'disabled';
    this.element = undefined;

    // Todo: should this live in baseTool?
    this.strategies = strategies || {};
    this.defaultStrategy =
      defaultStrategy || Object.keys(this.strategies)[0] || undefined;
    this.activeStrategy = this.defaultStrategy;

    //
    this.data = {};
    this._options = {};
    this._configuration = {};
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
    return this.strategies[this.activeStrategy](evt);
  }
}
