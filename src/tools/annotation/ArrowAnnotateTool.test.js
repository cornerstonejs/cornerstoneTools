import ArrowAnnotateTool from './ArrowAnnotateTool.js';

describe('ArrowAnnotateTool.js', () => {
  it('#getToolTextFromToolState should return an empty string', () => {
    const text = ArrowAnnotateTool.getToolTextFromToolState();

    expect(text).toEqual('');
  });
});
