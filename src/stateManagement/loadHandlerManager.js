let defaultStartLoadHandler;
let defaultDisplayLoadingHandler;
let defaultEndLoadHandler;
let defaultErrorLoadingHandler;

function setStartLoadHandler (handler) {
  defaultStartLoadHandler = handler;
}

function getStartLoadHandler () {
  return defaultStartLoadHandler;
}

function setDisplayLoadingHandler (handler) {
  defaultDisplayLoadingHandler = handler;
}

function getDisplayLoadingHandler () {
  return defaultDisplayLoadingHandler;
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
  setDisplayLoadingHandler,
  getDisplayLoadingHandler,
  setEndLoadHandler,
  getEndLoadHandler,
  setErrorLoadingHandler,
  getErrorLoadingHandler
};

export default loadHandlerManager;
