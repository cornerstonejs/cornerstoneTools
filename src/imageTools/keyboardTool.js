export default function (keyDownCallback) {
  let configuration = {};

  const toolInterface = {
    activate (element) {
      $(element).off('CornerstoneToolsKeyDown', keyDownCallback);
      $(element).on('CornerstoneToolsKeyDown', keyDownCallback);
    },
    disable (element) {
      $(element).off('CornerstoneToolsKeyDown', keyDownCallback);
    },
    enable (element) {
      $(element).off('CornerstoneToolsKeyDown', keyDownCallback);
    },
    deactivate (element) {
      $(element).off('CornerstoneToolsKeyDown', keyDownCallback);
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
