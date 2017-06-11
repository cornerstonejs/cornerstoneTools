import * as cornerstone from 'cornerstone-core';

// This function synchronizes the target zoom and pan to match the source
export default function (synchronizer, sourceElement, targetElement) {

    // Ignore the case where the source and target are the same enabled element
  if (targetElement === sourceElement) {
    return;
  }
    // Get the source and target viewports
  const sourceViewport = cornerstone.getViewport(sourceElement);
  const targetViewport = cornerstone.getViewport(targetElement);

    // Do nothing if the scale and translation are the same
  if (targetViewport.scale === sourceViewport.scale && targetViewport.translation.x === sourceViewport.translation.x && targetViewport.translation.y === sourceViewport.translation.y) {
    return;
  }

    // Scale and/or translation are different, sync them
  targetViewport.scale = sourceViewport.scale;
  targetViewport.translation.x = sourceViewport.translation.x;
  targetViewport.translation.y = sourceViewport.translation.y;
  synchronizer.setViewport(targetElement, targetViewport);
}
