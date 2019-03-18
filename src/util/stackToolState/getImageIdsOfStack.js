import { getToolState } from '../../stateManagement/index.js';

export default function(element) {
  const stackToolState = getToolState(element, 'stack');

  if (!stackToolState) {
    return;
  }

  return stackToolState.data[0].imageIds;
}
