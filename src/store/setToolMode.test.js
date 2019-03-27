import getToolForElement from './getToolForElement.js';
import triggerEvent from './../util/triggerEvent.js';
import {
  setToolModeForElement,
  _getNormalizedOptions,
  _mergeMouseButtonMask,
} from './setToolMode.js';

jest.mock('./getToolForElement.js');
jest.mock('./../util/triggerEvent.js');

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

    const mode = 'enabled';
    const changeEvent = null;
    const toolName = 'MyTool';
    const element = {};
    const options = undefined;

    setToolModeForElement(mode, changeEvent, element, toolName, options);

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

    const mode = 'enabled';
    const changeEvent = null;
    const toolName = 'MyTool';
    const element = {};
    const options = { mouseButtonMask: 1 };

    setToolModeForElement(mode, changeEvent, element, toolName, options);

    expect(mergeOptions).toBeCalledWith({ mouseButtonMask: [1] });
  });

  it('emits a status change event', () => {
    const testTool = {
      mode: undefined,
      options: { mouseButtonMask: [] },
      supportedInteractionTypes: ['Mouse'],
      mergeOptions: () => {},
    };

    getToolForElement.mockImplementationOnce(() => testTool);

    const mode = 'enabled';
    const changeEvent = 'EVENT_TYPE';
    const toolName = 'MyTool';
    const element = {};
    const options = { mouseButtonMask: [1] };

    setToolModeForElement(mode, changeEvent, element, toolName, options);

    expect(triggerEvent).toBeCalledWith(element, changeEvent, {
      options,
      toolName,
      type: changeEvent,
    });
  });
});

describe('_mergeMouseButtonMask', () => {
  it('merges buttonMask option with existing array', () => {
    const oldMask = [1];
    const newMask = [2];

    const merged = _mergeMouseButtonMask(oldMask, newMask);

    expect(merged).toEqual([1, 2]);
  });

  it('does not allow duplicate mouseButtonMasks', () => {
    const oldMask = [1, 1, 2];
    const newMask = [2, 2, 3];

    const merged = _mergeMouseButtonMask(oldMask, newMask);

    expect(merged).toEqual([1, 2, 3]);
  });
});

describe('_getNormalizedOptions', () => {
  // Undefined and null
  it('returns mouseButtonMask: [] when options is null', () => {
    const received = _getNormalizedOptions(null);

    expect(received).toEqual({ mouseButtonMask: [] });
  });
  it('returns mouseButtonMask: [] when options does not have property mouseButtonMask', () => {
    expect(_getNormalizedOptions({})).toEqual({
      mouseButtonMask: [],
    });
  });
  it('returns mouseButtonMask: [] when options.mouseButtonMask is undefined', () => {
    expect(_getNormalizedOptions({ mouseButtonMask: undefined })).toEqual({
      mouseButtonMask: [],
    });
  });
  it('returns mouseButtonMask: [] when options.mouseButtonMask is null', () => {
    expect(_getNormalizedOptions({ mouseButtonMask: null })).toEqual({
      mouseButtonMask: [],
    });
  });

  // Numbers
  it('returns mouseButtonMask: [] when options is 0', () => {
    expect(_getNormalizedOptions(0)).toEqual({ mouseButtonMask: [] });
  });
  it('returns mouseButtonMask: [num] when options is a number > 0', () => {
    expect(_getNormalizedOptions(1)).toEqual({ mouseButtonMask: [1] });
    expect(_getNormalizedOptions(2)).toEqual({ mouseButtonMask: [2] });
    expect(_getNormalizedOptions(3)).toEqual({ mouseButtonMask: [3] });
  });

  // Arrays
  it('returns mouseButtonMask: [1,2,3] when options is [1,2,3]', () => {
    expect(_getNormalizedOptions([1, 2, 3])).toEqual({
      mouseButtonMask: [1, 2, 3],
    });
  });
  it('returns mouseButtonMask: [1,2,3] when options.mouseButtonMask is [1,2,3]', () => {
    expect(_getNormalizedOptions({ mouseButtonMask: [1, 2, 3] })).toEqual({
      mouseButtonMask: [1, 2, 3],
    });
  });
});
