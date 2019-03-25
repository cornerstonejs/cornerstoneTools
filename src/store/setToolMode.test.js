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

  it('does not allow deplicates mouseButtonMasks', () => {
    const mergeOptions = jest.fn();
    const testTool = {
      mode: undefined,
      options: { mouseButtonMask: [1, 2] }, // <--- start with this
      supportedInteractionTypes: ['Mouse'],
      mergeOptions,
    };

    getToolForElement.mockImplementation(() => testTool);

    const toolName = 'MyTool';
    const options = { mouseButtonMask: 1 }; // <-- this should not cause a duplicate
    const element = {};

    setToolEnabledForElement(element, toolName, options);

    expect(mergeOptions).toBeCalledWith({ mouseButtonMask: [1, 2] });
  });
});
