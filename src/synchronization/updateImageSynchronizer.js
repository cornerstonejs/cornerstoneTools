import * as cornerstone from 'cornerstone-core';

// This function causes the target image to be drawn immediately
export default function (synchronizer, sourceElement, targetElement) {

    // Ignore the case where the source and target are the same enabled element
  if (targetElement === sourceElement) {
    return;
  }

  cornerstone.updateImage(targetElement);
}
