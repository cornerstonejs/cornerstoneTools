import './../externalModules.js';
import { newImageIdSpecificToolStateManager } from './imageIdSpecificStateManager.js';

jest.mock('./../externalModules.js');

describe('imageIdSpecificStateManager.add', () => {
  it('should add data to the exiting toolState', () => {
    const stateManager = newImageIdSpecificToolStateManager();
    const toolType = 'TestTool';
    const testElement = {};

    // Setup with some intial data
    // stateManager.restoreImageIdToolState(imageId, initialData);

    stateManager.add(testElement, toolType, 'data2');

    // Using "undefined" as the value here because the implementation of
    // the externalModules mock has an image without an imageId property.
    // There may be a better way of doing this.
    const imageId = undefined;

    const allToolState = stateManager.saveToolState();

    expect(allToolState[imageId][toolType].data).toContain('data2');
  });
});

describe('Just the syntax', () => {
  it('throws an error', () => {
    const enabledElement = {};
    const toolState = {};

    // --- the old implementation
    if (
      !enabledElement.image ||
      toolState.hasOwnProperty(enabledElement.image.imageId) === false
    ) {
      toolState[enabledElement.image.imageId] = {};
    }

    const imageIdToolState = toolState[enabledElement.image.imageId];

    console.log(imageIdToolState);
  });
});
