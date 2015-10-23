(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function saveImageToServer(element, url, type, encoderOptions) {
        var canvas = $(element).find('canvas').get(0);

        // Convert canvas to base64 dataURL
        // with optional image type (e.g. image/jpeg or image/png)
        // and an image quality parameter between 0 and 1
        var dataBase64;
        if (type) {
            dataBase64 = canvas.toDataURL(type);
        } else if (type && encoderOptions) {
            dataBase64 = canvas.toDataURL(type, encoderOptions);
        } else {
            dataBase64 = canvas.toDataURL();
        }
            
        var deferred = $.Deferred();

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var response = JSON.parse(xhr.response);
                    if (response.isValid) {
                        deferred.resolve(xhr.responseText);
                    } else {
                        deferred.reject(xhr.responseText);
                    }
                } else {
                    // The request didn't succeed
                    deferred.reject(xhr.responseText);
                }
            }
        };

        xhr.open('POST', url, true);
        xhr.send(dataBase64);

        return deferred.promise();
    }

    cornerstoneTools.saveImageToServer = saveImageToServer;

})($, cornerstone, cornerstoneTools);
