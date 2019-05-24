import external from '../externalModules';

export default function getPixelSpacing(image) {
  const imagePlane = external.cornerstone.metaData.get(
    'imagePlaneModule',
    image.imageId
  );

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
