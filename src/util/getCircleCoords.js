import external from '../externalModules';

/**
 * Retrieve the bounds of the circle in image coordinates
 *
 * @param {*} startHandle
 * @param {*} endHandle
 * @returns {{ left: number, top: number, width: number, height: number }}
 */
export default function getCircleCoords(startHandle, endHandle) {
  const { distance } = external.cornerstoneMath.point;
  const radius = distance(startHandle, endHandle);

  return {
    left: Math.floor(Math.min(startHandle.x - radius, endHandle.x)),
    top: Math.floor(Math.min(startHandle.y - radius, endHandle.y)),
    width: radius * 2,
    height: radius * 2,
  };
}
