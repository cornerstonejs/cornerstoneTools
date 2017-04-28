export default function (touchDragCallback, options) {
  let events = 'CornerstoneToolsTouchDrag';

  if (options && options.fireOnTouchStart === true) {
    events += ' CornerstoneToolsTouchStart';
  }

  const toolInterface = {
    activate (element) {
      $(element).off(events, touchDragCallback);

      if (options && options.eventData) {
        $(element).on(events, options.eventData, touchDragCallback);
      } else {
        $(element).on(events, touchDragCallback);
      }

      if (options && options.activateCallback) {
        options.activateCallback(element);
      }
    },
    disable (element) {
      $(element).off(events, touchDragCallback);
      if (options && options.disableCallback) {
        options.disableCallback(element);
      }
    },
    enable (element) {
      $(element).off(events, touchDragCallback);
      if (options && options.enableCallback) {
        options.enableCallback(element);
      }
    },
    deactivate (element) {
      $(element).off(events, touchDragCallback);
      if (options && options.deactivateCallback) {
        options.deactivateCallback(element);
      }
    }
  };


  return toolInterface;
}
