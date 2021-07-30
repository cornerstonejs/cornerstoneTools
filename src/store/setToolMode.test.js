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
      toolType: toolName, // Deprecation notice: toolType will be replaced by toolName
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
  // Shorthand examples
  it('returns { mouseButtonMask: [] } when options is undefined', () => {
    const received = _getNormalizedOptions(undefined);

    expect(received).toEqual({ mouseButtonMask: [] });
  });
  it('returns { mouseButtonMask: [] } when options is null', () => {
    const received = _getNormalizedOptions(null);

    expect(received).toEqual({ mouseButtonMask: [] });
  });
  it('returns { mouseButtonMask: [] } when options is 0', () => {
    expect(_getNormalizedOptions(0)).toEqual({ mouseButtonMask: [] });
  });
  it('returns { mouseButtonMask: [num] } when options is a number > 0', () => {
    expect(_getNormalizedOptions(1)).toEqual({ mouseButtonMask: [1] });
    expect(_getNormalizedOptions(2)).toEqual({ mouseButtonMask: [2] });
    expect(_getNormalizedOptions(3)).toEqual({ mouseButtonMask: [3] });
  });
  it('returns { mouseButtonMask: [1,2,3] } when options is [1,2,3]', () => {
    expect(_getNormalizedOptions([1, 2, 3])).toEqual({
      mouseButtonMask: [1, 2, 3],
    });
  });

  // Longhand examples
  it('returns { mouseButtonMask: [] } when options is {}', () => {
    expect(_getNormalizedOptions({})).toEqual({
      mouseButtonMask: [],
    });
  });
  it('returns { mouseButtonMask: [] } when options is { mouseButtonMask: undefined }', () => {
    expect(_getNormalizedOptions({ mouseButtonMask: undefined })).toEqual({
      mouseButtonMask: [],
    });
  });
  it('returns { mouseButtonMask: [] } when options is { mouseButtonMask: null }', () => {
    expect(_getNormalizedOptions({ mouseButtonMask: null })).toEqual({
      mouseButtonMask: [],
    });
  });
  it('returns { mouseButtonMask: [] } when options is { mouseButtonMask: 0 }', () => {
    expect(_getNormalizedOptions({ mouseButtonMask: null })).toEqual({
      mouseButtonMask: [],
    });
  });
  it('returns { mouseButtonMask: [1,2,3] } when options is { mouseButtonMask: [1,2,3] }', () => {
    expect(_getNormalizedOptions({ mouseButtonMask: [1, 2, 3] })).toEqual({
      mouseButtonMask: [1, 2, 3],
    });
  });

  // Invalid settings
  it('filters out invalid mouseButtonMask options', () => {
    expect(_getNormalizedOptions('something bad')).toEqual({
      mouseButtonMask: [],
    });
    expect(_getNormalizedOptions({ mouseButtonMask: 'something bad' })).toEqual(
      {
        mouseButtonMask: [],
      }
    );
    expect(_getNormalizedOptions({ mouseButtonMask: ['bad'] })).toEqual({
      mouseButtonMask: [],
    });
    expect(_getNormalizedOptions(['bad', 'bad', 'bad'])).toEqual({
      mouseButtonMask: [],
    });
    expect(_getNormalizedOptions([true, false])).toEqual({
      mouseButtonMask: [],
    });
    expect(_getNormalizedOptions([true, false, 1])).toEqual({
      mouseButtonMask: [1],
    });
    expect(_getNormalizedOptions({ mouseButtonMask: ['bad', 1] })).toEqual({
      mouseButtonMask: [1],
    });
  });

  // Other stuff
  it('does not modify any value other than mouseButtonMask', () => {
    const options = {
      // Tool specific options
      type: 'Teapot',
      size: 'little',
      height: 'short',
      build: 'stout',
      handleLocation: 'here',
      spoutLocation: 'here',
      // What this method cares about
      mouseButtonMask: 1,
    };

    const expectedResult = Object.assign({}, options, {
      mouseButtonMask: [1], // MouseButtonMask is normalised
    });

    expect(_getNormalizedOptions(options)).toEqual(expectedResult);
  });
});
