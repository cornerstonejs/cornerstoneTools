import scrollToIndex from './scrollToIndex.js';
import { getToolState } from '../stateManagement/toolState.js';

export default function (element, images) {
  const toolData = getToolState(element, 'stack');

  if (!toolData || !toolData.data || !toolData.data.length) {
    return;
  }

  const stackData = toolData.data[0];

  let newImageIdIndex = stackData.currentImageIdIndex + images;

  newImageIdIndex = Math.min(stackData.imageIds.length - 1, newImageIdIndex);
  newImageIdIndex = Math.max(0, newImageIdIndex);

  scrollToIndex(element, newImageIdIndex);
}
