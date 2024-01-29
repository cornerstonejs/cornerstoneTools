/**
 * The logic of this code is based on the DICOM standard part 3, section 10.7,
 * see https://dicom.nema.org/dicom/2013/output/chtml/part03/sect_10.7.html
 * especially section 10.7.1.1 Pixel Spacing.
 * The determination of units is done the same way as in the Diagnost Client,
 * see impaxee/com.agfa.pacs.impaxee/src/main/java/com/tiani/jvision/image/fithandler/SpacingDef.java
 * @param {Object} imagePlane
 * @returns {Object}
 */
export default function getProjectionRadiographPixelSpacing(imagePlane) {
  const imagerPixelSpacing = imagePlane.imagerPixelSpacing || [];
  const pixelSpacing = imagePlane.pixelSpacing || [];

  // ********************* CASE 1 *********************************
  // Pixel Spacing is present, Imager Pixel Spacing is not
  // meaning that it cannot be determined whether or not
  // correction or calibration have been performed.
  // Unit is mm_prj (projective)
  // **************************************************************
  if (pixelSpacing.length > 0 && imagerPixelSpacing.length === 0) {
    return {
      rowPixelSpacing: pixelSpacing[0],
      colPixelSpacing: pixelSpacing[1],
      unit: 'mm_prj',
    };
  } else if (imagerPixelSpacing.length > 0 && pixelSpacing.length > 0) {
    // ********************* CASE 2 *********************************
    // Pixel Spacing and Imager Pixel Spacing are the same
    // per standard this means that the image has not been calibrated
    // to correct for the effects of geometric magnification
    // the measurements are at the detector plane.
    // Unit is mm_prj (projective) or mm_est (estimated)
    // **************************************************************
    if (
      areTheSame(imagerPixelSpacing, pixelSpacing) ||
      estimatedRadiographicMagnificationFactorExists(imagePlane)
    ) {
      return getProjectivePixelSpacing(imagePlane);
    }

    // ********************* CASE 3 *********************************
    // Pixel Spacing and Imager Pixel Spacing are different
    // meaning the image has been corrected for known or assumed
    // geometric magnification or calibrated with respect to some
    // object of known size at known depth within the patient.
    // Unit is mm_approx (approximate)
    // **************************************************************
    return {
      rowPixelSpacing: pixelSpacing[0],
      colPixelSpacing: pixelSpacing[1],
      unit: 'mm_approx',
    };
  } else if (pixelSpacing.length === 0 && imagerPixelSpacing.length > 0) {
    // ********************* CASE 4 *********************************
    // Pixel Spacing is not present, Imager Pixel Spacing is present
    // if there is the estimated radiographic magnification factor
    // we can estimate the pixel spacing and the unit is mm_est
    // otherwise the unit is mm_prj (projective)
    // **************************************************************
    return getProjectivePixelSpacing(imagePlane);
  }

  return {
    rowPixelSpacing: undefined,
    colPixelSpacing: undefined,
    unit: 'pix',
  };
}

const getProjectivePixelSpacing = imagePlane => {
  const estimatedRadiographicMagnificationFactor =
    imagePlane.estimatedRadiographicMagnificationFactor || 1;

  return {
    rowPixelSpacing:
      imagePlane.imagerPixelSpacing[0] /
      estimatedRadiographicMagnificationFactor,
    colPixelSpacing:
      imagePlane.imagerPixelSpacing[1] /
      estimatedRadiographicMagnificationFactor,
    unit: estimatedRadiographicMagnificationFactorExists(imagePlane)
      ? 'mm_est'
      : 'mm_prj',
  };
};

const EPSILON = 1e-6;

const areTheSame = (a, b) =>
  Math.abs(a[0] - b[0]) < EPSILON && Math.abs(a[1] - b[1]) < EPSILON;

const estimatedRadiographicMagnificationFactorExists = imagePlane =>
  imagePlane.estimatedRadiographicMagnificationFactor ||
  imagePlane.estimatedRadiographicMagnificationFactor === 0;
