import angleTool from './angleTool.js';

export default class extends angleTool {
  constructor (name) {
    super(name || 'angleTouch');

    this.isTouchTool = true;
  }
}
