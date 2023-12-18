import TextMarkerTool from './TextMarkerTool.js';

describe('TextMarkerTool.js', () => {
  it('#getToolTextFromToolState should return the tools text', () => {
    // Arrange
    const context = {};
    const isColorImage = false;
    const toolState = {
      text: 'Text',
    };
    const modality = 'CT';
    const hasPixelSpacing = true;
    const displayUncertainties = true;

    // Act
    const text = TextMarkerTool.getToolTextFromToolState(
      context,
      isColorImage,
      toolState,
      modality,
      hasPixelSpacing,
      displayUncertainties
    );

    // Assert
    expect(text).toEqual('Text');
  });
});
