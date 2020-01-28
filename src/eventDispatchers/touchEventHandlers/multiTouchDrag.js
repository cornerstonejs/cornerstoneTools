import { state } from '../../store/index.js';
import getActiveToolsForElement from '../../store/getActiveToolsForElement.js';
import filterToolsUseableWithMultiPartTools from './../../store/filterToolsUsableWithMultiPartTools.js';

export default function(evt) {
  if (state.isToolLocked) {
    return false;
  }

  // TODO: We sometimes see a null detail for TOUCH_PRESS
  const { element, numPointers } = evt.detail;
  let tools = state.tools.filter(tool =>
    tool.supportedInteractionTypes.includes('MultiTouch')
  );

  // Tool is active, and specific callback is active
  tools = getActiveToolsForElement(element, tools, 'MultiTouch');
  // Tool has expected callback custom function
  tools = tools.filter(
    tool =>
      typeof tool.multiTouchDragCallback === 'function' &&
      numPointers === tool.configuration.touchPointers
  );

  if (state.isMultiPartToolActive) {
    tools = filterToolsUseableWithMultiPartTools(tools);
  }

  if (tools.length === 0) {
    return false;
  }

  const activeTool = tools[0];

  activeTool.multiTouchDragCallback(evt);
}
