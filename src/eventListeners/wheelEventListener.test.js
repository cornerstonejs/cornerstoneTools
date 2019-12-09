// SUT
import wheelEventListener from './wheelEventListener.js';

jest.mock('./../externalModules.js');

describe('eventListeners/wheelEventListener.js', () => {
  test('calling enable adds an event listener for native `wheel` event', () => {
    // Setup
    const element = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    // SUT
    wheelEventListener.enable(element);

    // Assert
    expect(element.removeEventListener).toHaveBeenCalledTimes(1);
    expect(element.addEventListener).toHaveBeenCalledTimes(1);
  });

  test('calling disable removes an event listener for native `wheel` event', () => {
    // Setup
    const element = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    // SUT
    wheelEventListener.disable(element);

    // Assert
    expect(element.removeEventListener).toHaveBeenCalledTimes(1);
  });

  it('emits an `cornerstonetoolsmousewheel` event when enabled element is scrolled', done => {
    // Setup
    const localElement = document.createElement('div');

    // Assert
    localElement.addEventListener('cornerstonetoolsmousewheel', () => {
      expect(true).toBe(true);
      done();
    });

    // SUT
    wheelEventListener.enable(localElement);
    localElement.dispatchEvent(new Event('wheel'));
  });

  test('calling enable multiple times does not duplicate listener', done => {
    // Setup
    const localElement = document.createElement('div');
    const scrollHandler = jest.fn();

    localElement.addEventListener('cornerstonetoolsmousewheel', () => {
      scrollHandler();
    });
    wheelEventListener.enable(localElement);
    wheelEventListener.enable(localElement);
    wheelEventListener.enable(localElement);

    // Fire Away!
    localElement.dispatchEvent(new Event('wheel'));

    // Assert
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/setImmediate
    setImmediate(() => {
      expect(scrollHandler).toHaveBeenCalledTimes(1);
      done();
    });
  });

  test('the `cornerstonetoolsmousewheel` event contains expected properties', done => {
    // Setup
    const localElement = document.createElement('div');
    const expectedEvtDetailKeys = [
      'element',
      'detail', // Original event
      'viewport',
      'image',
      'direction',
      'spinX',
      'spinY',
      'pixelX',
      'pixelY',
      'pageX',
      'pageY',
      'imageX',
      'imageY',
    ];

    wheelEventListener.enable(localElement);

    // Assert
    localElement.addEventListener('cornerstonetoolsmousewheel', evt => {
      expect(Object.keys(evt.detail).sort()).toEqual(
        expectedEvtDetailKeys.sort()
      );
      done();
    });

    // Fire Away!
    localElement.dispatchEvent(new Event('wheel'));
  });
});
