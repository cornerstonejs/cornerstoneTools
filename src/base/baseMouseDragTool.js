import baseTool from './baseTool.js';

class baseMouseDragTool extends baseTool {
  constructor (name, strategies, defaultStrategy) {
    super(name, strategies, defaultStrategy);

    this.isMouseTool = true;
  }

  mouseDragCallback (evt) {
    console.warn(`mouseDragCallback not implemented for ${this.toolName}`);
  }
}

export default baseMouseDragTool;
