import lengthGeneric from './lengthGeneric.js';

export default class extends lengthGeneric {
  constructor () {
    super('lengthMouse');

    this.isMouseTool = true;
  }
}
