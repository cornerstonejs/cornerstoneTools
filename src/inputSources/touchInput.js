var cornerstoneTools = (function($, cornerstone, cornerstoneMath, cornerstoneTools) {

    "use strict";

    /*jshint newcap: false */

    if (cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var lastScale = 1.0;
    var processingTouch = false;

    var startPoints;
    var lastPoints,touchEventDetail,eventData;
    
   
  
    function activateMouseDown(mouseEventDetail)
    {   
       $(mouseEventDetail.element).trigger("CornerstoneToolsDragStartActive", mouseEventDetail);
       
      
        
    }
    function onTouch(e)
    {
        e.gesture.preventDefault();
        e.gesture.stopPropagation();


        // we use a global flag to keep track of whether or not we are pinching
        // to avoid queueing up tons of events
        if (processingTouch === true)
        {
            return;
        }

        var element = e.currentTarget;
        var event;

        if (e.type === 'transform')
        {
          /*  var scale = lastScale - e.gesture.scale;
            lastScale = e.gesture.scale;
            event = new CustomEvent(
                    "CornerstoneToolsTouchPinch",
                    {
                        detail: {
                            event: e,
                            viewport: cornerstone.getViewport(element),
                            image: cornerstone.getEnabledElement(element).image,
                            element: element,
                            direction: scale < 0 ? 1 : -1
                        },
                        bubbles: false,
                        cancelable: false
                    }
            );*/

          var scale = lastScale - e.gesture.scale;
          lastScale = e.gesture.scale;
          var tranformEvent={event:e,viewport:cornerstone.getViewport(element),mage:cornerstone.getEnabledElement(element).image,element:element,
                             direction:scale < 0 ? 1 : -1
                    };
           event = jQuery.Event("CornerstoneToolsTouchPinch", tranformEvent);
          $(tranformEvent.element).trigger(event, tranformEvent);
          } else if (e.type === 'touch')
          {    
                startPoints = {
                page: cornerstoneMath.point.pageToPoint(e.gesture.touches[0]),
                image: cornerstone.pageToPixel(element, e.gesture.touches[0].pageX, e.gesture.touches[0].pageY)
            };
           
            touchEventDetail = {
                event: e,
                viewport: cornerstone.getViewport(element),
                image: cornerstone.getEnabledElement(element).image,
                element: element,
                startPoints: startPoints,
                lastPoints: lastPoints,
                currentPoints: startPoints,
                deltaPoints: {x: 0, y: 0}
            };
                
            event = jQuery.Event("CornerstoneToolsDragStart", touchEventDetail);
           $(touchEventDetail.element).trigger(event, touchEventDetail);
            lastPoints = cornerstoneTools.copyPoints(startPoints);
            //return cornerstoneTools.pauseEvent(e);
         

             if(event.isImmediatePropagationStopped() === false)
            {
                // no tools responded to this event, give the active tool a chance
                 
                if (activateMouseDown(touchEventDetail) === true)
                {                      
                    return cornerstoneTools.pauseEvent(e);
                }
             
            }
            
         

        }
//        else if (e.type === 'dragstart')
//        {
//            startPoints = {
//                page: cornerstoneMath.point.pageToPoint(e.gesture.touches[0]),
//                image: cornerstone.pageToPixel(element, e.gesture.touches[0].pageX, e.gesture.touches[0].pageY)
//            };
//            lastPoints = cornerstoneTools.copyPoints(startPoints);
//            return;
//        }

        else if (e.type === 'drag')
        {    
            // calculate our current points in page and image coordinates
             currentPoints = {
                page: cornerstoneMath.point.pageToPoint(e.gesture.touches[0]),
                image: cornerstone.pageToPixel(element, e.gesture.touches[0].pageX, e.gesture.touches[0].pageY)
            };

            // Calculate delta values in page and image coordinates
             deltaPoints = {
                page: cornerstoneMath.point.subtract(currentPoints.page, lastPoints.page),
                image: cornerstoneMath.point.subtract(currentPoints.image, lastPoints.image)
            };
          
             eventData={ viewport: cornerstone.getViewport(element),
                        image: cornerstone.getEnabledElement(element).image,
                        element: element,
                        startPoints: startPoints,
                        lastPoints: lastPoints,
                        currentPoints: currentPoints,
                        deltaPoints: deltaPoints
                        };
            $(touchEventDetail.element).trigger("CornerstoneToolsTouchDrag", eventData);

              
           lastPoints = cornerstoneTools.copyPoints(currentPoints);
            

        } else if (e.type === 'dragend')
        {
     

            var currentPoints = {
                page: cornerstoneMath.point.pageToPoint(e.gesture.touches[0]),
                image: cornerstone.pageToPixel(element, e.gesture.touches[0].pageX, e.gesture.touches[0].pageY)
            };

            // Calculate delta values in page and image coordinates
            var deltaPoints = {
                page: cornerstoneMath.point.subtract(currentPoints.page, lastPoints.page),
                image: cornerstoneMath.point.subtract(currentPoints.image, lastPoints.image)
            };

           

              eventData = {
                event: e,
                viewport: cornerstone.getViewport(element),
                image: cornerstone.getEnabledElement(element).image,
                element: element,
                startPoints: startPoints,
                lastPoints: lastPoints,
                currentPoints: currentPoints,
                deltaPoints: deltaPoints
            };
//            element.dispatchEvent(event);
              event = jQuery.Event("CornerstoneToolsDragEnd", eventData);
            $(touchEventDetail.element).trigger(event, eventData);
            return cornerstoneTools.pauseEvent(e);
        } else {
            return;
        }
        

        processingTouch = false;

        // we dispatch the event using a timer to allow the DOM to redraw
        /*setTimeout(function() {
            element.dispatchEvent(event);
            processingTouch = false;
        }, 1);*/
    }

    function enable(element)
    {
        var hammerOptions = {
            transform_always_block: true,
            transform_min_scale: 0.01,
            drag_block_horizontal: true,
            drag_block_vertical: true,
            drag_min_distance: 0

        };
         $(element).hammer(hammerOptions).on("touch drag transform dragstart dragend", onTouch);
    }

    function disable(element) {
         $(element).hammer().off("touch drag transform dragstart dragend", onTouch);
    }

    // module exports
    cornerstoneTools.touchInput = {
        enable: enable,
        disable: disable
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneMath, cornerstoneTools));
