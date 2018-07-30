import EVENTS from '../events.js';
import mouseToolEventDispatcher from './mouseToolEventDispatcher.js';
import {
  mouseDown,
  mouseDownActivate,
  mouseDoubleClick,
  mouseDrag,
  mouseMove,
  mouseWheel,
  onImageRendered
} from './mouseEventHandlers/index.js';

jest.mock('./mouseEventHandlers/index.js', () => ({
  mouseDown: jest.fn(),
  mouseDownActivate: jest.fn(),
  mouseDoubleClick: jest.fn(),
  mouseDrag: jest.fn(),
  mouseMove: jest.fn(),
  mouseWheel: jest.fn(),
  onImageRendered: jest.fn()
}));

describe('mouseToolEventDispatcher.js', () => {
  let element;

  beforeEach(() => {
    element = document.createElement('div');
    element.addEventListener = jest.fn();
    element.removeEventListener = jest.fn();
  });

  test('enable adds 9 event listeners to an element', () => {
    mouseToolEventDispatcher.enable(element);

    expect(element.addEventListener).toHaveBeenCalledTimes(7);
  });

  test('enable adds event listeners for all tap/touch events', () => {
    mouseToolEventDispatcher.enable(element);

    // https://github.com/jasmine/jasmine/issues/228#issuecomment-270599719
    expect(element.addEventListener.mock.calls).toEqual([
      [EVENTS.MOUSE_DOWN, mouseDown], // First call
      [EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivate], // Second call
      [EVENTS.MOUSE_DOUBLE_CLICK, mouseDoubleClick],
      [EVENTS.MOUSE_DRAG, mouseDrag],
      [EVENTS.MOUSE_MOVE, mouseMove],
      [EVENTS.MOUSE_WHEEL, mouseWheel],
      [EVENTS.IMAGE_RENDERED, onImageRendered]
    ]);
  });

  test('disable removes 7 event listeners to an element', () => {
    mouseToolEventDispatcher.disable(element);

    expect(element.removeEventListener).toHaveBeenCalledTimes(7);
  });

  test('disable removes event listeners for all tap/touch events', () => {
    mouseToolEventDispatcher.disable(element);

    // https://github.com/jasmine/jasmine/issues/228#issuecomment-270599719
    expect(element.removeEventListener.mock.calls).toEqual([
      [EVENTS.MOUSE_DOWN, mouseDown], // First call
      [EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivate], // Second call
      [EVENTS.MOUSE_DOUBLE_CLICK, mouseDoubleClick],
      [EVENTS.MOUSE_DRAG, mouseDrag],
      [EVENTS.MOUSE_MOVE, mouseMove],
      [EVENTS.MOUSE_WHEEL, mouseWheel],
      [EVENTS.IMAGE_RENDERED, onImageRendered]
    ]);
  });
});
