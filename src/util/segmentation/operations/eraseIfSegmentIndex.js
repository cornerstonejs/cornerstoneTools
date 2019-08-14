export default function(pixelIndex, segmentationData, segmentIndex) {
  if (segmentationData[pixelIndex] === segmentIndex) {
    segmentationData[pixelIndex] = 0;
  }
}
