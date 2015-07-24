(function(cornerstoneTools) {

    'use strict';

    function loadHandlerManager() {
        var defaultStartLoadHandler,
            defaultEndLoadHandler,
            defaultErrorLoadingHandler;

        function setStartLoadHandler(handler) {
            defaultStartLoadHandler = handler;
        }

        function getStartLoadHandler() {
            return defaultStartLoadHandler;
        }

        function setEndLoadHandler(handler) {
            defaultEndLoadHandler = handler;
        }

        function getEndLoadHandler(){
            return defaultEndLoadHandler;
        }

        function setErrorLoadingHandler(handler) {
            defaultErrorLoadingHandler = handler;
        }
        
        function getErrorLoadingHandler() {
            return defaultErrorLoadingHandler;
        }
      
        var loadHandlers = {
            setStartLoadHandler: setStartLoadHandler,
            getStartLoadHandler: getStartLoadHandler,
            setEndLoadHandler: setEndLoadHandler,
            getEndLoadHandler: getEndLoadHandler,
            setErrorLoadingHandler: setErrorLoadingHandler,
            getErrorLoadingHandler: getErrorLoadingHandler
        };

        return loadHandlers;
    }

    // module/private exports
    cornerstoneTools.loadHandlerManager = loadHandlerManager();

})(cornerstoneTools);
