var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    // This object is responsible for synchronizing target elements when an event fires on a source
    // element
    function Synchronizer(event, handler) {

        var that = this;
        var sourceElements = []; // source elements fire the events we want to synchronize to
        var targetElements = []; // target elements we want to synchronize to source elements

        var ignoreFiredEvents = false;

        function fireEvent(sourceEnabledElement) {

            // Broadcast an event that something changed
            ignoreFiredEvents = true;
            $.each(targetElements, function(index, targetEnabledElement) {
                handler(that, sourceEnabledElement, targetEnabledElement);
            });
            ignoreFiredEvents = false;
        }

        function onEvent(e)
        {
            if(ignoreFiredEvents === true) {
                //console.log("event ignored");
                return;
            }
            fireEvent(e.currentTarget);
        }

        // adds an element as a source
        this.addSource = function(element) {
            // Return if this element was previously added
            var index = sourceElements.indexOf(element);
            if(index !== -1) {
                return;
            }

            // Add to our list of enabled elements
            sourceElements.push(element);

            // subscribe to the event
            $(element).on(event, onEvent);

            // Update everyone listening for events
            fireEvent(element);
        };

        // adds an element as a target
        this.addTarget = function(element) {
            // Return if this element was previously added
            var index = targetElements.indexOf(element);
            if(index !== -1) {
                return;
            }

            // Add to our list of enabled elements
            targetElements.push(element);

            // Invoke the handler for this new target element
            handler(that, element, element);
        };

        // adds an element as both a source and a target
        this.add = function(element) {
            that.addSource(element);
            that.addTarget(element);
        };

        // removes an element as a source
        this.removeSource = function(element) {
            // Find the index of this element
            var index = sourceElements.indexOf(element);
            if(index === -1) {
                return;
            }

            // remove this element from the array
            sourceElements.splice(index, 1);

            // stop listening for the event
            $(element).off(event, onEvent);

            // Update everyone listening for events
            fireEvent(element);
        };

        // removes an element as a target
        this.removeTarget = function(element) {
            // Find the index of this element
            var index = targetElements.indexOf(element);
            if(index === -1) {
                return;
            }

            // remove this element from the array
            targetElements.splice(index, 1);

            // Invoke the handler for the removed target
            handler(that, element, element);
        };

        // removes an element as both a source and target
        this.remove = function(element) {
            that.removeTarget(element);
            that.removeSource(element);
        };

        // returns the source elements
        this.getSourceElements = function() {
            return sourceElements;
        };

        this.displayImage = function(element, image, viewport) {
            ignoreFiredEvents = true;
            cornerstone.displayImage(element, image, viewport);
            ignoreFiredEvents = false;
        };

        this.setViewport = function(element, viewport) {
            ignoreFiredEvents = true;
            cornerstone.setViewport(element, viewport);
            ignoreFiredEvents = false;
        };
    }

    // module/private exports
    cornerstoneTools.Synchronizer = Synchronizer;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));