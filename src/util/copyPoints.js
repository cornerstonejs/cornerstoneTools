import * as cornerstoneMath from 'cornerstone-math';

export default function (points) {
  const page = cornerstoneMath.point.copy(points.page);
  const image = cornerstoneMath.point.copy(points.image);
  const client = cornerstoneMath.point.copy(points.client);
  const canvas = cornerstoneMath.point.copy(points.canvas);

  return {
    page,
    image,
    client,
    canvas
  };
}
