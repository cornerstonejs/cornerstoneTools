import external from '../externalModules';

export default function getPixelSpacing(image, measurementData) {
  const imagePlane = external.cornerstone.metaData.get(
    'imagePlaneModule',
    image.imageId
  );

  const sopCommonModule = external.cornerstone.metaData.get(
    'sopCommonModule',
    image.imageId
  );

  if (
    measurementData &&
    sopCommonModule &&
    sopCommonModule.ultrasoundRegionSequence
  ) {
    let rowPixelSpacing;
    let colPixelSpacing;
    const ultrasoundRegionSequence = sopCommonModule.ultrasoundRegionSequence;

    ultrasoundRegionSequence.forEach(region => {
      if (isRegionInMm(region)) {
        const minX0 = region.regionLocationMinX0;
        const minY0 = region.regionLocationMinY0;
        const maxX1 = region.regionLocationMaxX1;
        const maxY1 = region.regionLocationMaxY1;

        if (
          areMeasurementHandlesInBounds(measurementData, {
            left: minX0,
            top: minY0,
            right: maxX1,
            bottom: maxY1,
          })
        ) {
          rowPixelSpacing = region.physicalDeltaX * 10;
          colPixelSpacing = region.physicalDeltaY * 10;
        }
      }
    });

    return {
      rowPixelSpacing,
      colPixelSpacing,
    };
  }

  if (imagePlane) {
    return {
      rowPixelSpacing:
        imagePlane.rowPixelSpacing || imagePlane.rowImagePixelSpacing,
      colPixelSpacing:
        imagePlane.columnPixelSpacing || imagePlane.colImagePixelSpacing,
    };
  }

  return {
    rowPixelSpacing: image.rowPixelSpacing,
    colPixelSpacing: image.columnPixelSpacing,
  };
}

const isRegionInMm = region => {
  const physicalUnitsXDirection = region.physicalUnitsXDirection;
  const physicalUnitsYDirection = region.physicalUnitsYDirection;
  const physicalDeltaX = region.physicalDeltaX;
  const physicalDeltaY = region.physicalDeltaY;

  return (
    physicalUnitsXDirection === 3 &&
    physicalUnitsYDirection === 3 &&
    physicalDeltaX !== 0 &&
    physicalDeltaY !== 0 &&
    physicalDeltaX === physicalDeltaY
  );
};

const areMeasurementHandlesInBounds = (measurementData, bounds) => {
  const { handles } = measurementData;

  return (
    handles.start.x >= bounds.left &&
    handles.start.x <= bounds.right &&
    handles.start.y >= bounds.top &&
    handles.start.y <= bounds.bottom &&
    handles.end.x >= bounds.left &&
    handles.end.x <= bounds.right &&
    handles.end.y >= bounds.top &&
    handles.end.y <= bounds.bottom
  );
};
