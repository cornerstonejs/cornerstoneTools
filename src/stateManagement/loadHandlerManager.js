let defaultStartLoadHandler;
let defaultEndLoadHandler;
let defaultErrorLoadingHandler;

function setStartLoadHandler (handler) {
  defaultStartLoadHandler = handler;
}

function getStartLoadHandler () {
  return defaultStartLoadHandler;
}

function setEndLoadHandler (handler) {
  defaultEndLoadHandler = handler;
}

function getEndLoadHandler () {
  return defaultEndLoadHandler;
}

function setErrorLoadingHandler (handler) {
  defaultErrorLoadingHandler = handler;
}

function getErrorLoadingHandler () {
  return defaultErrorLoadingHandler;
}

const loadHandlerManager = {
  setStartLoadHandler,
  getStartLoadHandler,
  setEndLoadHandler,
  getEndLoadHandler,
  setErrorLoadingHandler,
  getErrorLoadingHandler
};

export default loadHandlerManager;
