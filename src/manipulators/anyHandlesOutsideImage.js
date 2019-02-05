import external from '../externalModules.js';

/**
 * Determine if a handle is outside the bounds of the rendered image.
 * @public
 * @function anyHandlesOutsideImage
 * @memberof Manipulators
 *
 * @param {*} renderData - Cornerstone Tool's event detail
 * @param {Object} handles - An object containing named handles
 * @returns {Boolean} - True if the handle was placed outside the image
 */
export default function(renderData, handles) {
  const image = renderData.image;
  const imageRect = {
    left: 0,
    top: 0,
    width: image.width,
    height: image.height,
  };

  let handleOutsideImage = false;

  Object.keys(handles).forEach(function(name) {
    const handle = handles[name];

    if (handle.allowedOutsideImage === true) {
      return;
    }

    if (
      external.cornerstoneMath.point.insideRect(handle, imageRect) === false
    ) {
      handleOutsideImage = true;
    }
  });

  return handleOutsideImage;
}
