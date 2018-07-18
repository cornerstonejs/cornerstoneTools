import angleTool from './angleTool.js';

export default class extends angleTool {
  constructor (name) {
    super(name || 'angleMouse');

    this.isMouseTool = true;
  }
}
