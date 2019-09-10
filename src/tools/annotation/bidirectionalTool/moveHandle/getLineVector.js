export default function getLineVector(cps, rps, pointA, pointB) {
  const dx = (pointA.x - pointB.x) * cps;
  const dy = (pointA.y - pointB.y) * rps;
  const length = Math.sqrt(dx * dx + dy * dy);
  const vectorX = dx / length;
  const vectorY = dy / length;

  return {
    x: vectorX,
    y: vectorY,
  };
}
