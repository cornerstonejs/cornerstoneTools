let defaultStartLoadHandler = {};
let defaultEndLoadHandler = {};
let defaultErrorLoadingHandler = {};

function setStartLoadHandler(handler, element = undefined) {
  if (!handler) {
    throw new Error('The Handler function must be defined');
  }
  defaultStartLoadHandler[element] = handler;
}

function getStartLoadHandler(element) {
  return defaultStartLoadHandler[element];
}

function setEndLoadHandler(handler, element = undefined) {
  if (!handler) {
    throw new Error('The Handler function must be defined');
  }
  defaultEndLoadHandler[element] = handler;
}

function getEndLoadHandler(element) {
  return defaultEndLoadHandler[element];
}

function setErrorLoadingHandler(handler, element = undefined) {
  if (!handler) {
    throw new Error('The Handler function must be defined');
  }
  defaultErrorLoadingHandler[element] = handler;
}

function getErrorLoadingHandler(element) {
  return defaultErrorLoadingHandler[element];
}

function removeHandler(element) {
  delete defaultStartLoadHandler[element];
  delete defaultEndLoadHandler[element];
  delete defaultErrorLoadingHandler[element];
}

const loadHandlerManager = {
  setStartLoadHandler,
  getStartLoadHandler,
  setEndLoadHandler,
  getEndLoadHandler,
  setErrorLoadingHandler,
  getErrorLoadingHandler,
  removeHandler,
};

export default loadHandlerManager;
