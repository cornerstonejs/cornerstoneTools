export default function() {
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

    return {
        setStartLoadHandler,
        getStartLoadHandler,
        setEndLoadHandler,
        getEndLoadHandler,
        setErrorLoadingHandler,
        getErrorLoadingHandler
    };
}