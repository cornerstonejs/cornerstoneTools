// State
import { getters, state } from './../../store/index.js';
import { getToolState } from './../../stateManagement/toolState.js';

import getToolsWithMoveableHandles from '../../store/getToolsWithMoveableHandles.js';
import { findHandleDataNearImagePoint } from '../../util/findAndMoveHelpers.js';
import getInteractiveToolsForElement from './../../store/getInteractiveToolsForElement.js';
import getToolsWithDataForElement from './../../store/getToolsWithDataForElement.js';
import filterToolsUseableWithMultiPartTools from './../../store/filterToolsUsableWithMultiPartTools.js';

/**
 *
 *
 * @private
 * @param {keydown} evt
 * @listens {CornerstoneTools.event:cornerstonetoolskeydown}
 * @returns {undefined}
 */
export default function(evt) {
  if (state.isToolLocked) {
    return;
  }

  const element = evt.detail.element;

  const activeAndPassiveTools = getInteractiveToolsForElement(
    element,
    getters.keyboardTools()
  );

  let activeTools = activeAndPassiveTools.filter(
    tool => tool.mode === 'active'
  );

  if (state.isMultiPartToolActive) {
    activeTools = filterToolsUseableWithMultiPartTools(activeTools);
  }

  if (activeTools.length > 0) {
    const firstActiveTool = activeTools[0];

    if (typeof firstActiveTool.handleKeyboardCallback === 'function') {
      firstActiveTool.handleKeyboardCallback(evt);
    }
  }
}