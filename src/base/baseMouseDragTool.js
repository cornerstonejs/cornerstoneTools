import baseTool from './baseTool.js';

class baseMouseDragTool extends baseTool {
  constructor (name) {
    super(name);
  }

  mouseDown (evt) {
    console.warn(`mouseDown not implemented for ${this.toolName}`);
  }

  mouseMove (evt) {
    console.warn(`mouseDown not implemented for ${this.toolName}`);
  }
}

export default baseMouseDragTool;
