import store from '../store/';
import external from '../externalModules';

export default function getKeyPressData(e) {
  const cornerstone = external.cornerstone;
  const element = e.currentTarget;
  const enabledElement = cornerstone.getEnabledElement(element);

  if (!enabledElement || !enabledElement.image) {
    return;
  }

  const currentPointsImage = store.state.mousePositionImage;

  return {
    event: window.event || e, // Old IE support
    element,
    viewport: cornerstone.getViewport(element),
    image: enabledElement.image,
    currentPoints: {
      image: currentPointsImage,
      canvas: cornerstone.pixelToCanvas(element, currentPointsImage),
    },
    keyCode: e.keyCode,
    which: e.which,
  };
}
