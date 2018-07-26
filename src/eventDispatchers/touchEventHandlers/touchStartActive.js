// State
import { getters } from './../../store/index.js';
// Todo: Where should these live?
import getActiveToolsForElement from './../../store/getActiveToolsForElement.js';

export default function (evt) {
  console.log('touchStartActive');
  //   If (isAwaitingTouchUp) {
  //     Return;
  //   }

  const element = evt.detail.element;
  const tools = getActiveToolsForElement(element, getters.touchTools());
  const activeTool = tools[0];

  // Note: custom `addNewMeasurement` will need to prevent event bubbling
  if (activeTool.addNewMeasurement) {
    activeTool.addNewMeasurement(evt, 'touch');
  } else if (activeTool.isAnnotationTool) {
    addNewMeasurement(evt, activeTool);
  }
}
