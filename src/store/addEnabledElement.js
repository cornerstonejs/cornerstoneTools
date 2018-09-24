import {
  keyboardEventListeners,
  mouseEventListeners,
  mouseWheelEventListeners,
  touchEventListeners
} from '../eventListeners/index.js';
import {
  imageRenderedEventDispatcher,
  mouseToolEventDispatcher,
  newImageEventDispatcher,
  touchToolEventDispatcher
} from '../eventDispatchers/index.js';
import { mutations } from './index.js';
import generateGUID from './generateGUID.js';
import external from './../externalModules.js';
import store from './../store/index.js';

export default function (elementEnabledEvt) {
  const enabledElement = elementEnabledEvt.detail.element;
  // NOTE: the 'enabledElement' argument here is actually the DOM element...
  const cornerstoneEnabledElement = external.cornerstone.getEnabledElement(
    enabledElement
  );

  // TEMP
  if (cornerstoneEnabledElement.uuid) {
    console.warn(
      'uuid has gone core! remove this block and the generateGUID function.'
    );
  } else {
    cornerstoneEnabledElement.uuid = generateGUID();
  }
  // TEMP

  // Listeners
  keyboardEventListeners.enable(enabledElement);
  mouseEventListeners.enable(enabledElement);
  mouseWheelEventListeners.enable(enabledElement);

  // Dispatchers
  imageRenderedEventDispatcher.enable(enabledElement);
  mouseToolEventDispatcher.enable(enabledElement);
  newImageEventDispatcher.enable(enabledElement);

  if (store.modules.globalConfiguration.state.touchEnabled) {
    touchEventListeners.enable(enabledElement);
    touchToolEventDispatcher.enable(enabledElement);
  }

  // State
  mutations.ADD_ENABLED_ELEMENT(enabledElement);
}
