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
    sopCommonModule.ultrasoundRegionSequence &&
    sopCommonModule.ultrasoundRegionSequence.length > 0
  ) {
    let rowPixelSpacing;
    let colPixelSpacing;
    const ultrasoundRegionSequence = sopCommonModule.ultrasoundRegionSequence;

    ultrasoundRegionSequence.forEach(region => {
      if (isRegionValid(region)) {
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

const isRegionValid = region => {
  const isRegionInMm =
    region.physicalUnitsXDirection === 3 &&
    region.physicalUnitsYDirection === 3;
  const pixelSizeX = region.physicalDeltaX * 10;
  const pixelSizeY = region.physicalDeltaY * 10;

  return isRegionInMm && areValuesValid(pixelSizeX, pixelSizeY);
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

const EPSILON = 1e-6;

const isAlmostZero = value => -EPSILON < value && value < EPSILON;

const isValid = value => !isNaN(value) && !isAlmostZero(value);

const areValuesValid = (pixelSizeX, pixelSizeY) =>
  isValid(pixelSizeX) && isValid(pixelSizeY);
