import baseTool from './../base/baseTool.js';

export default class extends baseTool {
  constructor (name) {
    super({
      name: name || 'stackScroll',
      supportedInteractionTypes: ['mouse']
    });
  }
}
