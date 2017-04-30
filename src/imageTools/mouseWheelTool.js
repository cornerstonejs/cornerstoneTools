export default function (mouseWheelCallback) {
  const toolInterface = {
    activate (element) {
      $(element).off('CornerstoneToolsMouseWheel', mouseWheelCallback);
      const eventData = {
      };

      $(element).on('CornerstoneToolsMouseWheel', eventData, mouseWheelCallback);
    },
    disable (element) {
      $(element).off('CornerstoneToolsMouseWheel', mouseWheelCallback);
    },
    enable (element) {
      $(element).off('CornerstoneToolsMouseWheel', mouseWheelCallback);
    },
    deactivate (element) {
      $(element).off('CornerstoneToolsMouseWheel', mouseWheelCallback);
    }
  };


  return toolInterface;
}
