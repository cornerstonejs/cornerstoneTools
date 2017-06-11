import * as cornerstoneMath from 'cornerstone-math';

export default function (renderData, handles) {
  const image = renderData.image;
  const imageRect = {
    left: 0,
    top: 0,
    width: image.width,
    height: image.height
  };

  let handleOutsideImage = false;

  Object.keys(handles).forEach(function (name) {
    const handle = handles[name];

    if (handle.allowedOutsideImage === true) {
      return;
    }

    if (cornerstoneMath.point.insideRect(handle, imageRect) === false) {
      handleOutsideImage = true;
    }
  });

  return handleOutsideImage;
}
