import external from './../../../../externalModules.js';

// Return the newPosition for the handle based on the mmStep and handles
export default function(image, handles, handleKey, mmStep, mmLimit = 1) {
  if (handleKey === 'textBox') {
    return;
  }

  // Defines how much the arm will increase/decrease
  const columnPixelSpacing = (image && image.columnPixelSpacing) || 1;
  const rowPixelSpacing = (image && image.rowPixelSpacing) || 1;
  const stepX = mmStep * (1 / columnPixelSpacing);
  const stepY = mmStep * (1 / rowPixelSpacing);

  // Get the line angle and its handles
  const keyA = handleKey;
  const keyB = inverseKeyMap[handleKey];
  const handleA = handles[keyA];
  const handleB = handles[keyB];
  const angle = Math.atan2(handleA.y - handleB.y, handleA.x - handleB.x);

  // Calculate the new position of the handle
  const newPosition = {
    x: handleA.x + Math.cos(angle) * stepX,
    y: handleA.y + Math.sin(angle) * stepY,
  };

  if (mmStep < 0) {
    // Get the perpendicular handles
    const keyC = perpendicularKeyMap[keyA];
    const keyD = perpendicularKeyMap[keyB];
    const handleC = handles[keyC];
    const handleD = handles[keyD];

    // Create the line segment for the arm being resized
    const lineAB = {
      start: Object.assign(
        {},
        ...['x', 'y'].map(key => ({ [key]: handleA[key] }))
      ),
      end: Object.assign(
        {},
        ...['x', 'y'].map(key => ({ [key]: handleB[key] }))
      ),
    };

    // Create the line segment for the perpendicular arm
    const lineCD = {
      start: Object.assign(
        {},
        ...['x', 'y'].map(key => ({ [key]: handleC[key] }))
      ),
      end: Object.assign(
        {},
        ...['x', 'y'].map(key => ({ [key]: handleD[key] }))
      ),
    };

    // Get the intersection point between the arms
    const intersection = external.cornerstoneMath.lineSegment.intersectLine(
      lineAB,
      lineCD
    );

    // Keep the minimum distance of 0.1 mm to the intersection point
    const dx = (intersection.x - newPosition.x) * columnPixelSpacing;
    const dy = (intersection.y - newPosition.y) * rowPixelSpacing;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const newAngle = Math.atan2(
      newPosition.y - intersection.y,
      newPosition.x - intersection.x
    );

    if (
      angle.toFixed(8) !== newAngle.toFixed(8) ||
      distance < Math.abs(mmLimit)
    ) {
      Object.assign(newPosition, {
        x: intersection.x - Math.cos(angle) * mmLimit * Math.sign(stepX),
        y: intersection.y - Math.sin(angle) * mmLimit * Math.sign(stepY),
      });
    }
  }

  return newPosition;
}

const inverseKeyMap = {
  start: 'end',
  end: 'start',
  perpendicularStart: 'perpendicularEnd',
  perpendicularEnd: 'perpendicularStart',
};

const perpendicularKeyMap = {
  start: 'perpendicularStart',
  end: 'perpendicularEnd',
  perpendicularStart: 'start',
  perpendicularEnd: 'end',
};
