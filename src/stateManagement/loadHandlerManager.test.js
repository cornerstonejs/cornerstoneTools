import loadHandlerManager from './loadHandlerManager';
import externalModules from './../externalModules.js';

jest.mock('./../externalModules.js');

describe('loadHandlerManager', () => {
  const elements = [
    {
      uuid: 'a.5.b.6.4.9.1e12.992.2.9.62a8ea91d561d50bd364df6c48c3631253e82b1',
      handler_function() {
        return 0;
      },
    },
    {
      uuid: 'a.5.b.6.4.9.1e12.992.2.9.62a8ea91d561d50bd364df6c48c3631253e82b2',
      handler_function() {
        return 1;
      },
    },
    {
      uuid: 'a.5.b.6.4.9.1e12.992.2.9.62a8ea91d561d50bd364df6c48c3631253e82b3',
      handler_function() {
        return 2;
      },
    },
  ];

  it('should create multiples loadHandler for StartLoadHandler', () => {
    elements.forEach((element, index) => {
      externalModules.cornerstone.getEnabledElement.mockImplementation(
        () => element
      );
      loadHandlerManager.setStartLoadHandler(element.handler_function, element);
      const start = loadHandlerManager.getStartLoadHandler(element);
      expect(start()).toBe(index);
    });
  });

  it('should create multiples loadHandler for setEndLoadHandler', () => {
    elements.forEach((element, index) => {
      externalModules.cornerstone.getEnabledElement.mockImplementation(
        () => element
      );
      loadHandlerManager.setEndLoadHandler(element.handler_function, element);
      const end = loadHandlerManager.getEndLoadHandler(element);
      expect(end()).toBe(index);
    });
  });

  it('should create multiples loadHandler for setErrorLoadingHandler', () => {
    elements.forEach((element, index) => {
      externalModules.cornerstone.getEnabledElement.mockImplementation(
        () => element
      );
      loadHandlerManager.setErrorLoadingHandler(
        element.handler_function,
        element
      );
      const error = loadHandlerManager.getErrorLoadingHandler(element);
      expect(error()).toBe(index);
    });
  });

  it('should create a single loadHandler even though the element is undefined', () => {
    const element = elements[0];

    externalModules.cornerstone.getEnabledElement.mockImplementation(
      () => element
    );
    loadHandlerManager.setErrorLoadingHandler(
      element.handler_function,
      element
    );
    const error = loadHandlerManager.getErrorLoadingHandler(element);
    expect(error()).toBe(0);
  });

  it('should create a single loadHandler even though the element is not passed as parameter to the function', () => {
    loadHandlerManager.setErrorLoadingHandler(() => {
      return 0;
    });

    const error = loadHandlerManager.getErrorLoadingHandler();
    expect(error()).toBe(0);
  });

  it('should throw an error if handler function is not defined for setStartLoadHandler', () => {
    let throwError = {};

    try {
      loadHandlerManager.setStartLoadHandler();
    } catch (error) {
      throwError = error;
    }

    expect(throwError).toEqual(
      new Error('The Handler function must be defined')
    );
  });

  it('should throw an error if handler function is not defined for setEndLoadHandler', () => {
    let throwError = {};

    try {
      loadHandlerManager.setEndLoadHandler();
    } catch (error) {
      throwError = error;
    }

    expect(throwError).toEqual(
      new Error('The Handler function must be defined')
    );
  });

  it('should throw an error if handler function is not defined for setErrorLoadingHandler', () => {
    let throwError = {};

    try {
      loadHandlerManager.setErrorLoadingHandler();
    } catch (error) {
      throwError = error;
    }

    expect(throwError).toEqual(
      new Error('The Handler function must be defined')
    );
  });

  it('should remove loadHandler for multiple handlers', () => {
    const items = [1, 2, 3];

    items.forEach(i => {
      loadHandlerManager.setStartLoadHandler(() => {
        return i;
      }, i);

      loadHandlerManager.setEndLoadHandler(() => {
        return i;
      }, i);

      loadHandlerManager.setErrorLoadingHandler(() => {
        return i;
      }, i);
    });

    items.forEach(i => {
      loadHandlerManager.removeHandlers(i);
    });

    loadHandlerManager.removeHandlers();

    items.forEach(i => {
      const start = loadHandlerManager.getStartLoadHandler(i);
      const end = loadHandlerManager.getEndLoadHandler(i);
      const error = loadHandlerManager.getErrorLoadingHandler(i);
      expect(start).toBe(undefined);
      expect(end).toBe(undefined);
      expect(error).toBe(undefined);
    });
  });

  it('should remove loadHandler a single handler', () => {
    loadHandlerManager.setStartLoadHandler(() => {
      return 0;
    });

    loadHandlerManager.setEndLoadHandler(() => {
      return 0;
    });

    loadHandlerManager.setErrorLoadingHandler(() => {
      return 0;
    });

    loadHandlerManager.removeHandlers();

    const start = loadHandlerManager.getStartLoadHandler();
    const end = loadHandlerManager.getEndLoadHandler();
    const error = loadHandlerManager.getErrorLoadingHandler();
    expect(start).toBe(undefined);
    expect(end).toBe(undefined);
    expect(error).toBe(undefined);
  });
});
