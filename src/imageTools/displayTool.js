export default function (onImageRendered) {
  let configuration = {};

  const toolInterface = {
    disable (element) {
      element.removeEventListener('CornerstoneImageRendered', onImageRendered);
    },
    enable (element) {
      element.removeEventListener('CornerstoneImageRendered', onImageRendered);
      element.addEventListener('CornerstoneImageRendered', onImageRendered);
      cornerstone.updateImage(element);
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
