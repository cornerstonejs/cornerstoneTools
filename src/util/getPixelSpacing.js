import external from '../externalModules';

export default function getPixelSpacing(image) {
  const imagePlane = external.cornerstone.metaData.get(
    'imagePlaneModule',
    image.imageId
  );

  if (imagePlane) {
    return {
      rowPixelSpacing:
        imagePlane.rowPixelSpacing || imagePlane.rowImagePixelSpacing || 1,
      colPixelSpacing:
        imagePlane.columnPixelSpacing || imagePlane.colImagePixelSpacing || 1,
    };
  }

  return {
    rowPixelSpacing: image.rowPixelSpacing || 1,
    colPixelSpacing: image.columnPixelSpacing || 1,
  };
}
