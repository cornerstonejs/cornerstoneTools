// this module defines a way for tools to access various metadata about an imageId.  This layer of abstraction exists
// so metadata can be provided to the tools in different ways (e.g. by parsing DICOM P10 or by a WADO-RS document)
// NOTE: We may want to push this function down into the cornerstone core library, not sure yet...

var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var providers = [];

    function addProvider( provider)
    {
        providers.push(provider);
    }

    function removeProvider( provider)
    {
        var index = providers.indexOf(provider);
        if(index === -1) {
            return;
        }
        providers.splice(index, 1);
    }

    function getMetaData(type, imageId)
    {
        var result;
        $.each(providers, function(index, provider) {
            result = provider(type, imageId);
            if(result !== undefined) {
                return true;
            }
        });
        return result;
    }

    // module/private exports
    cornerstoneTools.metaData =
    {
        addProvider: addProvider,
        removeProvider: removeProvider,
        get : getMetaData
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));