import baseAnnotationTool from './baseAnnotationTool.js';

export default class extends baseAnnotationTool {
  constructor (toolName) {
    super(toolName);
  }

  mouseMove (evt) {
    console.warn(`mouseMove not implemented for ${this.toolName}`);
  }
  mouseDown (evt) {
    console.warn(`mouseDown not implemented for ${this.toolName}`);
  }
  mouseDownActivate (evt) {
    console.warn(`mouseDownActivate not implemented for ${this.toolName}`);
  }
  mouseDoubleClick (evt) {
    console.warn(`mouseDoubleClick not implemented for ${this.toolName}`);
  }
}
