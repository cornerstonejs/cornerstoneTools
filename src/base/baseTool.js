export default class {
  constructor (toolName) {
    this.toolName = toolName;
    this.mode = 'disabled';
    this.options = {};
    this.configuration = {};
    this.element = undefined;
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
