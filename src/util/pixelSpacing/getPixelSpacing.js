import external from '../../externalModules';
import getUltraSoundPixelSpacing from './getUltraSoundPixelSpacing';
import getProjectionRadiographicPixelSpacing from './getProjectionRadiographicPixelSpacing';

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
    return getUltraSoundPixelSpacing(
      sopCommonModule.ultrasoundRegionSequence,
      measurementData
    );
  }

  if (imagePlane) {
    if (isProjection(imagePlane)) {
      return getProjectionRadiographicPixelSpacing(imagePlane);
    }

    return getPixelSpacingAndUnit(imagePlane);
  }

  return getPixelSpacingAndUnit(image);
}

const isProjection = imagePlane => {
  const { sopClassUid } = imagePlane;
  const projectionRadiographSOPClassUIDs = [
    '1.2.840.10008.5.1.4.1.1.1', // Computed Radiography Image Storage
    '1.2.840.10008.5.1.4.1.1.1.1', // Digital X-Ray Image Storage for Presentation
    '1.2.840.10008.5.1.4.1.1.1.2', // Digital Mammography X-Ray Image Storage for Presentation
    '1.2.840.10008.5.1.4.1.1.1.2.1', // Digital Mammography X-Ray Image Storage for Processing
    '1.2.840.10008.5.1.4.1.1.1.3', // Digital Intraoral X-Ray Image Storage for Presentation
    '1.2.840.10008.5.1.4.1.1.1.3.1', // Digital Intraoral X-Ray Image Storage for Processing
    '1.2.840.10008.5.1.4.1.1.12.1', // X-Ray Angiographic Image Storage
    '1.2.840.10008.5.1.4.1.1.12.1.1', // Enhanced XA Image Storage
    '1.2.840.10008.5.1.4.1.1.12.2', // X-Ray Radiofluoroscopic Image Storage
    '1.2.840.10008.5.1.4.1.1.12.2.1', // Enhanced XRF Image Storage
  ];

  return projectionRadiographSOPClassUIDs.includes(sopClassUid);
};

const getPixelSpacingAndUnit = obj => {
  const rowPixelSpacing = obj.rowPixelSpacing || obj.rowImagePixelSpacing;
  const colPixelSpacing = obj.columnPixelSpacing || obj.colImagePixelSpacing;
  const hasPixelSpacing = rowPixelSpacing && colPixelSpacing;
  const unit = hasPixelSpacing ? 'mm' : 'pix';

  return {
    rowPixelSpacing,
    colPixelSpacing,
    unit,
  };
};
