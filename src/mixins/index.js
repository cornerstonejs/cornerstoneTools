/**
 * Mixins are "tool beahviors" that can be added to a tool via its mixin
 * array configuration property
 * @namespace CornerstoneTools.Mixins
 */

import activeOrDisabledBinaryTool from './activeOrDisabledBinaryTool.js';
import enabledOrDisabledBinaryTool from './enabledOrDisabledBinaryTool.js';

export default {
  activeOrDisabledBinaryTool,
  enabledOrDisabledBinaryTool,
};
