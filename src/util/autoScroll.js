var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    /**
     * Set Window width and window center
     * @param {Obj} element DOM object
     * @param {Array} wwwc    [(Integer) window width, (Integer) window center]
     */
    function setWWWC (element, wwwc)
    {
        var viewport = cornerstone.getViewport(element);

    
        if (!viewport){

            // no image rendered, bind to event to set later
            $(element).one("CornerstoneImageRendered", function(){
                setWWWC(element, wwwc);
            });

            return false;
        }
        

        if (wwwc[0]){
            viewport.voi.windowWidth = parseInt(wwwc[0], 10);
        }
        if (wwwc[1]){
            viewport.voi.windowCenter = parseInt(wwwc[1], 10);
        }

        cornerstone.setViewport(element, viewport);
    }

    function autoScroll (element, instance, animate){

        animate = typeof animate === 'undefined' ? true : animate;

        var stackData = cornerstoneTools.getToolState(element, 'stack').data[0];
        var currentImageIdIndex = stackData.currentImageIdIndex;

        var targetInstance = parseInt(instance, 10) - 1; // use 0 indexed numbering

        if (targetInstance === parseInt(currentImageIdIndex, 10)){
            return false;
        }

        var goToInstance = function(instance) {

            var viewport = cornerstone.getViewport(element);
            var imageId = stackData.imageIds[instance];

            if (!imageId){
                console.error('Image index not found in this series');
                return false;
            }

            if (!viewport){

            }

            stackData.currentImageIdIndex = instance;

            var image = cornerstone.imageCache.getImagePromise(imageId);

            if (image){
                // if image has already loaded and is cached, display it while scrolling through
                image.then(function(image){
                    cornerstone.displayImage(element, image);
                });
            } else {
                // if image isn't cached, and this is the target image, load and cache it
                if (stackData.currentImageIdIndex === targetInstance) {

                    cornerstone.loadAndCacheImage(imageId, element).then(function(image) {
                        cornerstone.displayImage(element, image);
                    });
                } else {
                // otherwise, just skip the image to make it faster to autoscroll
                    return false;
                }
            }

        };

        // turn off animation for now
        animate = false;

        if (animate){

            var diff = targetInstance - currentImageIdIndex;
            var dir = targetInstance > currentImageIdIndex ? 1 : -1;
            var i = 0;

            var move = function(){
                if (diff){
                    diff -= dir;
                    goToInstance(stackData.currentImageIdIndex + dir);
                    window.setTimeout(function(){
                        move();
                    }, Math.easeInOutCubic(i, 0, Math.abs(diff), 1000));
                    i++;
                }
            };
            
            move();
        } else {
            goToInstance(targetInstance);
        }
    }

    Math.easeInOutCubic = function (t, b, c, d) {
        t = t / (d/2);
        if (t < 1){ return c/2*t*t*t + b; }
        t -= 2;
        return c/2*(t*t*t + 2) + b;
    };

    // module exports
    cornerstoneTools.setWWWC = setWWWC;
    cornerstoneTools.autoScroll = autoScroll;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
