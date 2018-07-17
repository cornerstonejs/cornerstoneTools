import lengthGeneric from './lengthGeneric.js';

export default class extends lengthGeneric {
  constructor () {
    super('lengthTouch');

    this.isTouchTool = true;
  }
}
