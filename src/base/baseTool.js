export default class {
  constructor (name) {
    this.name = name;
    this.mode = 'disabled';
    this.element = undefined;

    //
    this.data = {};
    this.options = {};
    this.configuration = {};
  }

  getConfiguration () {
    return this.configuration;
  }

  setConfiguration (config) {
    this.configuration = config;
  }

  // ToolOptions.js
  getOptions () {
    return this.options;
  }

  setOptions (options) {
    this.options = options;
  }

  clearOptions () {
    this.options = {};
  }
}
