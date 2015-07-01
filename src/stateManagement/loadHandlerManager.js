var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function loadHandlerManager() {
        var defaultStartLoadHandler,
            defaultEndLoadHandler;

        function setStartLoadHandler(handler){
            defaultStartLoadHandler = handler;
        }
        
        function getStartLoadHandler(){
            return defaultStartLoadHandler;
        }

        function setEndLoadHandler(handler){
            defaultEndLoadHandler = handler;
        }
        
        function getEndLoadHandler(){
            return defaultEndLoadHandler;
        }
      
        var loadHandlers = {
            setStartLoadHandler: setStartLoadHandler,
            getStartLoadHandler: getStartLoadHandler,
            setEndLoadHandler: setEndLoadHandler,
            getEndLoadHandler: getEndLoadHandler
        };

        return loadHandlers;
    }

    // module/private exports
    cornerstoneTools.loadHandlerManager = loadHandlerManager();

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
