import external from '../externalModules.js';


export default function (image) {
  const imagePlane = external.cornerstone.metaData.get('imagePlaneModule', image.imageId);
  let rowPixelSpacing;
  let colPixelSpacing;

  if (imagePlane) {
    rowPixelSpacing = imagePlane.rowPixelSpacing || imagePlane.rowImagePixelSpacing;
    colPixelSpacing = imagePlane.columnPixelSpacing || imagePlane.colImagePixelSpacing;
  } else {
    rowPixelSpacing = image.rowPixelSpacing;
    colPixelSpacing = image.columnPixelSpacing;
  }

  return { rowPixelSpacing,
    colPixelSpacing };
}
