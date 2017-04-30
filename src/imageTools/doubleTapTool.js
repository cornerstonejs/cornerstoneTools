export default function (doubleTapCallback) {
  const toolInterface = {
    activate (element) {
      $(element).off('CornerstoneToolsDoubleTap', doubleTapCallback);
      const eventData = {};

      $(element).on('CornerstoneToolsDoubleTap', eventData, doubleTapCallback);
    },
    disable (element) {
      $(element).off('CornerstoneToolsDoubleTap', doubleTapCallback);
    },
    enable (element) {
      $(element).off('CornerstoneToolsDoubleTap', doubleTapCallback);
    },
    deactivate (element) {
      $(element).off('CornerstoneToolsDoubleTap', doubleTapCallback);
    }
  };


  return toolInterface;
}
