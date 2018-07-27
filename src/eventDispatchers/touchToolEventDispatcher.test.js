import EVENTS from '../events.js';
import touchToolEventDispatcher from './touchToolEventDispatcher.js';
import {
  tap,
  doubleTap,
  touchStart,
  touchStartActive,
  touchDrag,
  touchEnd,
  touchPress,
  touchPinch,
  onImageRendered
} from './touchEventHandlers/index.js';

jest.mock('./touchEventHandlers/index.js', () => ({
  tap: jest.fn(),
  doubleTap: jest.fn(),
  touchStart: jest.fn(),
  touchStartActive: jest.fn(),
  touchDrag: jest.fn(),
  touchEnd: jest.fn(),
  touchPress: jest.fn(),
  touchPinch: jest.fn(),
  onImageRendered: jest.fn()
}));

describe('touchToolEventDispatcher.js', () => {
  let element;

  beforeEach(() => {
    element = document.createElement('div');
    element.addEventListener = jest.fn();
    element.removeEventListener = jest.fn();
  });

  test('enable adds 9 event listeners to an element', () => {
    touchToolEventDispatcher.enable(element);

    expect(element.addEventListener).toHaveBeenCalledTimes(9);
  });

  test('enable adds event listeners for all tap/touch events', () => {
    touchToolEventDispatcher.enable(element);

    // https://github.com/jasmine/jasmine/issues/228#issuecomment-270599719
    expect(element.addEventListener.mock.calls).toEqual([
      [EVENTS.TAP, tap], // First call
      [EVENTS.TOUCH_START, touchStart], // Second call
      [EVENTS.TOUCH_DRAG, touchDrag],
      [EVENTS.TOUCH_END, touchEnd],
      [EVENTS.TOUCH_START_ACTIVE, touchStartActive],
      [EVENTS.TOUCH_PRESS, touchPress],
      [EVENTS.DOUBLE_TAP, doubleTap],
      [EVENTS.TOUCH_PINCH, touchPinch],
      [EVENTS.IMAGE_RENDERED, onImageRendered]
    ]);
  });

  test('disable removes 9 event listeners to an element', () => {
    touchToolEventDispatcher.disable(element);

    expect(element.removeEventListener).toHaveBeenCalledTimes(9);
  });

  test('disable removes event listeners for all tap/touch events', () => {
    touchToolEventDispatcher.disable(element);

    // https://github.com/jasmine/jasmine/issues/228#issuecomment-270599719
    expect(element.removeEventListener.mock.calls).toEqual([
      [EVENTS.TAP, tap], // First call
      [EVENTS.TOUCH_START, touchStart], // Second call
      [EVENTS.TOUCH_DRAG, touchDrag],
      [EVENTS.TOUCH_END, touchEnd],
      [EVENTS.TOUCH_START_ACTIVE, touchStartActive],
      [EVENTS.TOUCH_PRESS, touchPress],
      [EVENTS.DOUBLE_TAP, doubleTap],
      [EVENTS.TOUCH_PINCH, touchPinch],
      [EVENTS.IMAGE_RENDERED, onImageRendered]
    ]);
  });
});
