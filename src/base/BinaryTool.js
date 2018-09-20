import external from './../externalModules.js';
import BaseTool from './BaseTool.js';

/** @abstract @class
 *  BinaryTools are intended to only be enabled or disabled, and will throw an
 *  error if set passive or active.
 */
export default class BinaryTool extends BaseTool {
  constructor ({
    name,
    strategies,
    defaultStrategy,
    configuration,
    supportedInteractionTypes
  }) {
    super({
      name,
      strategies,
      defaultStrategy,
      configuration,
      supportedInteractionTypes
    });
  }

  passiveCallback (element) {
    throw new Error('BinaryTool\'s may only be enabled or disabled.');
  }

  activeCallback (element) {
    throw new Error('BinaryTool\'s may only be enabled or disabled.');
  }
}
