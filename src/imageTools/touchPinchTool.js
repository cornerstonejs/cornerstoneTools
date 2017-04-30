export default function (touchPinchCallback) {
  const toolInterface = {
    activate (element) {
      $(element).off('CornerstoneToolsTouchPinch', touchPinchCallback);
      const eventData = {
      };

      $(element).on('CornerstoneToolsTouchPinch', eventData, touchPinchCallback);
    },
    disable (element) {
      $(element).off('CornerstoneToolsTouchPinch', touchPinchCallback);
    },
    enable (element) {
      $(element).off('CornerstoneToolsTouchPinch', touchPinchCallback);
    },
    deactivate (element) {
      $(element).off('CornerstoneToolsTouchPinch', touchPinchCallback);
    }
  };


  return toolInterface;
}
