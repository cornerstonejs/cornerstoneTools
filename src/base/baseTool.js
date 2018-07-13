export default class {
  constructor (name) {
    this.name = name;
    this.mode = 'disabled';
    this.element = undefined;

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
}
