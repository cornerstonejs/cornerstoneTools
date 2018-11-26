import EVENTS from '../events.js';
import mouseToolEventDispatcher from './mouseToolEventDispatcher.js';
import {
  mouseClick,
  mouseDown,
  mouseDownActivate,
  mouseDoubleClick,
  mouseDrag,
  mouseMove,
  mouseUp,
  mouseWheel,
} from './mouseEventHandlers/index.js';

jest.mock('./mouseEventHandlers/index.js', () => ({
  mouseClick: jest.fn(),
  mouseDown: jest.fn(),
  mouseDownActivate: jest.fn(),
  mouseDoubleClick: jest.fn(),
  mouseDrag: jest.fn(),
  mouseMove: jest.fn(),
  mouseUp: jest.fn(),
  mouseWheel: jest.fn(),
}));

describe('eventDispatchers/mouseToolEventDispatcher.js', () => {
  let element;

  beforeEach(() => {
    element = document.createElement('div');
    element.addEventListener = jest.fn();
    element.removeEventListener = jest.fn();
  });

  test('enable adds 7 event listeners to an element', () => {
    mouseToolEventDispatcher.enable(element);

    expect(element.addEventListener).toHaveBeenCalledTimes(8);
  });

  test('enable adds event listeners for all tap/touch events', () => {
    mouseToolEventDispatcher.enable(element);

    // https://github.com/jasmine/jasmine/issues/228#issuecomment-270599719
    expect(element.addEventListener.mock.calls).toEqual([
      [EVENTS.MOUSE_CLICK, mouseClick],
      [EVENTS.MOUSE_DOWN, mouseDown], // First call
      [EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivate], // Second call
      [EVENTS.MOUSE_DOUBLE_CLICK, mouseDoubleClick],
      [EVENTS.MOUSE_DRAG, mouseDrag],
      [EVENTS.MOUSE_MOVE, mouseMove],
      [EVENTS.MOUSE_UP, mouseUp],
      [EVENTS.MOUSE_WHEEL, mouseWheel],
    ]);
  });

  test('disable removes 6 event listeners to an element', () => {
    mouseToolEventDispatcher.disable(element);

    expect(element.removeEventListener).toHaveBeenCalledTimes(8);
  });

  test('disable removes event listeners for all tap/touch events', () => {
    mouseToolEventDispatcher.disable(element);

    // https://github.com/jasmine/jasmine/issues/228#issuecomment-270599719
    expect(element.removeEventListener.mock.calls).toEqual([
      [EVENTS.MOUSE_CLICK, mouseClick],
      [EVENTS.MOUSE_DOWN, mouseDown], // First call
      [EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivate], // Second call
      [EVENTS.MOUSE_DOUBLE_CLICK, mouseDoubleClick],
      [EVENTS.MOUSE_DRAG, mouseDrag],
      [EVENTS.MOUSE_MOVE, mouseMove],
      [EVENTS.MOUSE_UP, mouseUp],
      [EVENTS.MOUSE_WHEEL, mouseWheel],
    ]);
  });
});
