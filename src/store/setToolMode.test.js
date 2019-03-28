import getToolForElement from './getToolForElement.js';
import { setToolEnabledForElement } from './setToolMode.js';

jest.mock('./getToolForElement.js');

describe('setToolModeForElement', () => {
  it('sets the tool.mode to enabled', () => {
    const mergeOptions = jest.fn();
    const testTool = {
      mode: undefined,
      options: { mouseButtonMask: [] },
      supportedInteractionTypes: ['Mouse'],
      mergeOptions,
    };

    getToolForElement.mockImplementationOnce(() => testTool);

    const toolName = 'MyTool';
    const element = {};

    setToolEnabledForElement(element, toolName);

    expect(testTool.mode).toBe('enabled');
  });

  it('can set the buttonMask option', () => {
    const mergeOptions = jest.fn();
    const testTool = {
      mode: undefined,
      options: { mouseButtonMask: [] },
      supportedInteractionTypes: ['Mouse'],
      mergeOptions,
    };

    getToolForElement.mockImplementationOnce(() => testTool);

    const toolName = 'MyTool';
    const options = { mouseButtonMask: 1 };
    const element = {};

    setToolEnabledForElement(element, toolName, options);

    expect(mergeOptions).toBeCalledWith({ mouseButtonMask: [1] });
  });

  it('merges buttonMask option with existing array', () => {
    const mergeOptions = jest.fn();
    const testTool = {
      mode: undefined,
      options: { mouseButtonMask: [2] },
      supportedInteractionTypes: ['Mouse'],
      mergeOptions,
    };

    getToolForElement.mockImplementationOnce(() => testTool);

    const toolName = 'MyTool';
    const options = { mouseButtonMask: 1 };
    const element = {};

    setToolEnabledForElement(element, toolName, options);

    expect(mergeOptions).toBeCalledWith({ mouseButtonMask: [1, 2] });
  });

  it('does not allow duplicate mouseButtonMasks', () => {
    const mergeOptions = jest.fn();
    const testTool = {
      mode: undefined,
      options: { mouseButtonMask: [1, 1, 2] }, // <--- start with this
      supportedInteractionTypes: ['Mouse'],
      mergeOptions,
    };

    getToolForElement.mockImplementationOnce(() => testTool);

    const toolName = 'MyTool';
    const options = { mouseButtonMask: [2, 2, 3] }; // <-- "add" this
    const element = {};

    setToolEnabledForElement(element, toolName, options);

    const { mouseButtonMask } = mergeOptions.mock.calls[0][0];

    // Note: sorting is required to because Array.from(set) can
    // does not guarantee the order of results returned.
    expect(mouseButtonMask.sort()).toEqual([1, 2, 3]);
  });
});
