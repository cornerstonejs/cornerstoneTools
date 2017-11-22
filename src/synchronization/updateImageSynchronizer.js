import external from '../externalModules.js';

// This function causes the target image to be drawn immediately
export default function (synchronizer, sourceElement, targetElement) {

  // Ignore the case where the source and target are the same enabled element
  if (targetElement === sourceElement) {
    return;
  }

  external.cornerstone.updateImage(targetElement);
}
