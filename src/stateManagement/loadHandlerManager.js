let defaultStartLoadHandler = {};
let defaultEndLoadHandler = {};
let defaultErrorLoadingHandler = {};

function setStartLoadHandler(handler, element) {
  defaultStartLoadHandler[element] = handler;
}

function getStartLoadHandler(element) {
  return defaultStartLoadHandler[element];
}

function setEndLoadHandler(handler, element) {
  defaultEndLoadHandler[element] = handler;
}

function getEndLoadHandler(element) {
  return defaultEndLoadHandler[element];
}

function setErrorLoadingHandler(handler, element) {
  defaultErrorLoadingHandler[element] = handler;
}

function getErrorLoadingHandler(element) {
  return defaultErrorLoadingHandler[element];
}

const loadHandlerManager = {
  setStartLoadHandler,
  getStartLoadHandler,
  setEndLoadHandler,
  getEndLoadHandler,
  setErrorLoadingHandler,
  getErrorLoadingHandler,
};

export default loadHandlerManager;
