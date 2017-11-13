import { external } from '../externalModules.js';

export default function (touchDragCallback, options) {
  let configuration = {};
  let events = 'CornerstoneToolsMultiTouchDrag';

  if (options && options.fireOnTouchStart === true) {
    events += ' CornerstoneToolsMultiTouchStart';
  }

  const toolInterface = {
    activate (element) {
      external.$(element).off(events, touchDragCallback);

      if (options && options.eventData) {
        external.$(element).on(events, options.eventData, touchDragCallback);
      } else {
        external.$(element).on(events, touchDragCallback);
      }

      if (options && options.activateCallback) {
        options.activateCallback(element);
      }
    },
    disable (element) {
      external.$(element).off(events, touchDragCallback);
      if (options && options.disableCallback) {
        options.disableCallback(element);
      }
    },
    enable (element) {
      external.$(element).off(events, touchDragCallback);
      if (options && options.enableCallback) {
        options.enableCallback(element);
      }
    },
    deactivate (element) {
      external.$(element).off(events, touchDragCallback);
      if (options && options.deactivateCallback) {
        options.deactivateCallback(element);
      }
    },
    getConfiguration () {
      return configuration;
    },
    setConfiguration (config) {
      configuration = config;
    }
  };


  return toolInterface;
}
