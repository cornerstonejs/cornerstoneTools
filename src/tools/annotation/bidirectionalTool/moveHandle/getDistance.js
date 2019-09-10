export default function getDistance(cps, rps, pointA, pointB) {
  const calcX = (pointA.x - pointB.x) / rps;
  const calcY = (pointA.y - pointB.y) / cps;

  return Math.sqrt(calcX * calcX + calcY * calcY);
}
