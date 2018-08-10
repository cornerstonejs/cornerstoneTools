import baseTool from './../base/baseTool.js';
import external from './../externalModules.js';

export default class extends baseTool {
  constructor (name = 'crosshair') {
    super({
      name,
      supportedInteractionTypes: ['mouse', 'touch']
    });
  }
}
