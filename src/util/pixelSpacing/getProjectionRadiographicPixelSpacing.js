export default function getProjectionRadiographicPixelSpacing(imagePlane) {
  const imagerPixelSpacing = imagePlane.imagerPixelSpacing || [];
  const pixelSpacing = imagePlane.pixelSpacing || [];

  // ********************* CASE 1 *********************************
  // this is a projection radiograph and we only have pixel spacing
  // so we assume there is no calibration
  // (we don't know whether the spacing is calibrated or not)
  // unit is mm_prj (projective)
  // **************************************************************
  if (pixelSpacing.length > 0 && imagerPixelSpacing.length === 0) {
    return {
      rowPixelSpacing: pixelSpacing[0],
      colPixelSpacing: pixelSpacing[1],
      unit: 'mm_prj',
    };
  } else if (imagerPixelSpacing.length > 0 && pixelSpacing.length > 0) {
    // ********************* CASE 2 *********************************
    // pixel spacing and imager pixel spacing are the same
    // the measurements are at the detector plane
    // unit is mm_prj (projective) or mm_est (estimated)
    // **************************************************************
    if (
      areTheSame(imagerPixelSpacing, pixelSpacing) ||
      estimatedRadiographicMagnificationFactorExists(imagePlane)
    ) {
      return getProjectivePixelSpacing(imagePlane);
    }

    // ********************* CASE 3 *********************************
    // pixel spacing and imager pixel spacing are different
    // meaning they're calibrated
    // unit is mm_approx (approximate)
    // **************************************************************
    return {
      rowPixelSpacing: pixelSpacing[0],
      colPixelSpacing: pixelSpacing[1],
      unit: 'mm_approx',
    };
  } else if (pixelSpacing.length === 0 && imagerPixelSpacing.length > 0) {
    // ********************* CASE 4 *********************************
    // we only have imager pixel spacing
    // if we have an estimated radiographic magnification factor
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
