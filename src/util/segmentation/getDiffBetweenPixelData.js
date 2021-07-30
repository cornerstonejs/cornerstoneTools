export default function getDiffBetweenPixelData(
  previousPixelData,
  newPixelData
) {
  const diff = [];

  for (let i = 0; i < previousPixelData.length; i++) {
    if (previousPixelData[i] !== newPixelData[i]) {
      diff.push([i, previousPixelData[i], newPixelData[i]]);
    }
  }

  return diff;
}
