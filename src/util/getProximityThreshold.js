import { state } from '../store';

/**
 * Returns the proximity threshold for the given interaction type, looking first
 * at the tool configuration and then at global configuration.
 *
 * @public
 * @function getProximityThreshold
 *
 * @param {string} interactionType The interaction type (mouse or touch)
 * @param {string} toolName The name of the tool
 * @returns {Number} The proximity threshold based on the tool
 */
export default function getProximityThreshold(interactionType, toolName) {
  let { clickProximity, touchProximity } = state;
  const tool = state.tools.find(({ name }) => name === toolName);

  if (tool && tool.configuration) {
    clickProximity = tool.configuration.clickProximity || clickProximity;
    touchProximity = tool.configuration.touchProximity || touchProximity;
  }

  return interactionType === 'mouse' ? clickProximity : touchProximity;
}
