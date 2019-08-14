export default function eraseOutsideBoundingBox(evt, topLeft, bottomRight) {
  const eventData = evt.detail;
  const { operationData } = evt;
  const { segmentationData, segmentIndex } = operationData;

  const { image } = eventData;
  const { width, height } = image;

  // Loop until top of bounding box from top of image, color the entire row
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < topLeft[1]; j++) {
      eraseIfSegmentIndex(j * width + i, segmentationData, segmentIndex);
    }
  }

  // Loop within rows of bounding box, to the left of the box
  for (let i = 0; i < topLeft[0]; i++) {
    for (let j = topLeft[1]; j < bottomRight[1]; j++) {
      eraseIfSegmentIndex(j * width + i, segmentationData, segmentIndex);
    }
  }

  // Loop within rows of bounding box, to the right of the box
  for (let i = bottomRight[0]; i < width; i++) {
    for (let j = topLeft[1]; j < bottomRight[1]; j++) {
      eraseIfSegmentIndex(j * width + i, segmentationData, segmentIndex);
    }
  }

  // Loop from bottom of bounding box until bottom of image, color entire row
  for (let i = 0; i < width; i++) {
    for (let j = bottomRight[1]; j < height; j++) {
      eraseIfSegmentIndex(j * width + i, segmentationData, segmentIndex);
    }
  }
}

function eraseIfSegmentIndex(pixelIndex, segmentationData, segmentIndex) {
  if (segmentationData[pixelIndex] === segmentIndex) {
    segmentationData[pixelIndex] = 0;
  }
}
