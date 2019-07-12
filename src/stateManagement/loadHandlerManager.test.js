import loadHandlerManager from './loadHandlerManager';

describe('loadHandlerManager', () => {
  it('should create multiples loadHandler for StartLoadHandler', () => {
    const items = [1, 2, 3];

    items.forEach(i => {
      loadHandlerManager.setStartLoadHandler(() => {
        return i;
      }, i);
    });

    items.forEach(i => {
      const start = loadHandlerManager.getStartLoadHandler(i);
      expect(start()).toBe(i);
    });
  });

  it('should create multiples loadHandler for setEndLoadHandler', () => {
    const items = [1, 2, 3];

    items.forEach(i => {
      loadHandlerManager.setEndLoadHandler(() => {
        return i;
      }, i);
    });

    items.forEach(i => {
      const start = loadHandlerManager.getEndLoadHandler(i);
      expect(start()).toBe(i);
    });
  });

  it('should create multiples loadHandler for setErrorLoadingHandler', () => {
    const items = [1, 2, 3];

    items.forEach(i => {
      loadHandlerManager.setErrorLoadingHandler(() => {
        return i;
      }, i);
    });

    items.forEach(i => {
      const start = loadHandlerManager.getErrorLoadingHandler(i);
      expect(start()).toBe(i);
    });
  });

  it('should create a single loadHandler even though the element is undefined', () => {
    loadHandlerManager.setErrorLoadingHandler(() => {
      return 0;
    }, undefined);

    const start = loadHandlerManager.getErrorLoadingHandler(undefined);
    expect(start()).toBe(0);
  });

  it('should create a single loadHandler even though the element is not passed as parameter to the function', () => {
    loadHandlerManager.setErrorLoadingHandler(() => {
      return 0;
    });

    const start = loadHandlerManager.getErrorLoadingHandler();
    expect(start()).toBe(0);
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

  it('should return undefined when calling getStartLoadHandler if the element does not exist at the loadHandlerManager', () => {
    loadHandlerManager.setStartLoadHandler(() => {
      return 0;
    }, 1);

    const startLoadHandler = loadHandlerManager.getStartLoadHandler(10);
    expect(startLoadHandler).toEqual(undefined);
  });

  it('should return undefined when calling getEndLoadHandler if the element does not exist at the loadHandlerManager', () => {
    loadHandlerManager.setEndLoadHandler(() => {
      return 0;
    }, 1);

    const startLoadHandler = loadHandlerManager.getEndLoadHandler(10);
    expect(startLoadHandler).toEqual(undefined);
  });

  it('should return undefined when calling getErrorLoadingHandler if the element does not exist at the loadHandlerManager', () => {
    loadHandlerManager.setErrorLoadingHandler(() => {
      return 0;
    }, 1);

    const startLoadHandler = loadHandlerManager.getErrorLoadingHandler(10);
    expect(startLoadHandler).toEqual(undefined);
  });
});
