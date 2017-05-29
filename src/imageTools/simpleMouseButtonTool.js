export default function (mouseDownCallback) {
  let configuration = {};

  const toolInterface = {
    activate (element, mouseButtonMask, options) {
      $(element).off('CornerstoneToolsMouseDownActivate', mouseDownCallback);
      const eventData = {
        mouseButtonMask,
        options
      };

      $(element).on('CornerstoneToolsMouseDownActivate', eventData, mouseDownCallback);
    },
    disable (element) {
      $(element).off('CornerstoneToolsMouseDownActivate', mouseDownCallback);
    },
    enable (element) {
      $(element).off('CornerstoneToolsMouseDownActivate', mouseDownCallback);
    },
    deactivate (element) {
      $(element).off('CornerstoneToolsMouseDownActivate', mouseDownCallback);
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
