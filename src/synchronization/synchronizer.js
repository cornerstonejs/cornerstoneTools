(function($, cornerstone, cornerstoneTools) {

    'use strict';

    // This object is responsible for synchronizing target elements when an event fires on a source
    // element
    function Synchronizer(event, handler) {

        var that = this;
        var sourceElements = []; // source elements fire the events we want to synchronize to
        var targetElements = []; // target elements we want to synchronize to source elements

        var ignoreFiredEvents = false;
        var initialData = {};
        var eventHandler = handler;

        this.setHandler = function(handler) {
            eventHandler = handler;
        };

        this.getHandler = function() {
            return eventHandler;
        };

        this.getDistances = function() {
            if (!sourceElements.length || !targetElements.length) {
                return;
            }

            initialData.distances = {};
            initialData.imageIds = {
                sourceElements: [],
                targetElements: []
            };

            sourceElements.forEach(function(sourceElement) {
                var sourceEnabledElement = cornerstone.getEnabledElement(sourceElement);
                if (!sourceEnabledElement || !sourceEnabledElement.image) {
                    return;
                }

                var sourceImageId = sourceEnabledElement.image.imageId;
                var sourceImagePlane = cornerstoneTools.metaData.get('imagePlane', sourceImageId);
                if (!sourceImagePlane || !sourceImagePlane.imagePositionPatient) {
                    return;
                }

                var sourceImagePosition = sourceImagePlane.imagePositionPatient;

                if (initialData.hasOwnProperty(sourceEnabledElement)) {
                    return;
                } else {
                    initialData.distances[sourceImageId] = {};
                }

                initialData.imageIds.sourceElements.push(sourceImageId);

                targetElements.forEach(function(targetElement) {
                    var targetEnabledElement = cornerstone.getEnabledElement(targetElement);
                    if (!targetEnabledElement || !targetEnabledElement.image) {
                        return;
                    }

                    var targetImageId = targetEnabledElement.image.imageId;

                    initialData.imageIds.targetElements.push(targetImageId);

                    if (sourceElement === targetElement) {
                        return;
                    }

                    if (sourceImageId === targetImageId) {
                        return;
                    }

                    if (initialData.distances[sourceImageId].hasOwnProperty(targetImageId)) {
                        return;
                    }

                    var targetImagePlane = cornerstoneTools.metaData.get('imagePlane', targetImageId);
                    if (!targetImagePlane || !targetImagePlane.imagePositionPatient) {
                        return;
                    }

                    var targetImagePosition = targetImagePlane.imagePositionPatient;

                    initialData.distances[sourceImageId][targetImageId] = targetImagePosition.clone().sub(sourceImagePosition);
                });

                if (!Object.keys(initialData.distances[sourceImageId]).length) {
                    delete initialData.distances[sourceImageId];
                }
            });
        };

        function fireEvent(sourceElement, eventData) {
            // Broadcast an event that something changed
            if (!sourceElements.length || !targetElements.length) {
                return;
            }

            ignoreFiredEvents = true;
            targetElements.forEach(function(targetElement) {
                var targetIndex = targetElements.indexOf(targetElement);
                if (targetIndex === -1) {
                    return;
                }

                var targetImageId = initialData.imageIds.targetElements[targetIndex];
                var sourceIndex = sourceElements.indexOf(sourceElement);
                if (sourceIndex === -1) {
                    return;
                }

                var sourceImageId = initialData.imageIds.sourceElements[sourceIndex];
                
                var positionDifference;
                if (sourceImageId === targetImageId) {
                    positionDifference = 0;
                } else {
                    positionDifference = initialData.distances[sourceImageId][targetImageId];
                }
                
                eventHandler(that, sourceElement, targetElement, eventData, positionDifference);
            });
            ignoreFiredEvents = false;
        }

        function onEvent(e, eventData) {
            if (ignoreFiredEvents === true) {
                return;
            }

            fireEvent(e.currentTarget, eventData);
        }

        // adds an element as a source
        this.addSource = function(element) {
            // Return if this element was previously added
            var index = sourceElements.indexOf(element);
            if (index !== -1) {
                return;
            }

            // Add to our list of enabled elements
            sourceElements.push(element);

            // subscribe to the event
            $(element).on(event, onEvent);

            // Update the inital distances between elements
            that.getDistances();

            that.updateDisableHandlers();
        };

        // adds an element as a target
        this.addTarget = function(element) {
            // Return if this element was previously added
            var index = targetElements.indexOf(element);
            if (index !== -1) {
                return;
            }

            // Add to our list of enabled elements
            targetElements.push(element);

            // Update the inital distances between elements
            that.getDistances();

            // Invoke the handler for this new target element
            eventHandler(that, element, element, 0);

            that.updateDisableHandlers();
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
            if (index === -1) {
                return;
            }

            // remove this element from the array
            sourceElements.splice(index, 1);

            // stop listening for the event
            $(element).off(event, onEvent);

            // Update the inital distances between elements
            that.getDistances();

            // Update everyone listening for events
            fireEvent(element);
            that.updateDisableHandlers();
        };

        // removes an element as a target
        this.removeTarget = function(element) {
            // Find the index of this element
            var index = targetElements.indexOf(element);
            if (index === -1) {
                return;
            }

            // remove this element from the array
            targetElements.splice(index, 1);

            // Update the inital distances between elements
            that.getDistances();

            // Invoke the handler for the removed target
            eventHandler(that, element, element, 0);
            that.updateDisableHandlers();
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

        // returns the target elements
        this.getTargetElements = function() {
            return targetElements;
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

        function disableHandler(e, eventData) {
            var element = eventData.element;
            that.remove(element);
        }

        this.updateDisableHandlers = function() {
            var elements = $.unique(sourceElements.concat(targetElements));
            elements.forEach(function(element) {
                $(element).off('CornerstoneElementDisabled', disableHandler);
                $(element).on('CornerstoneElementDisabled', disableHandler);
            });
        };

        this.destroy = function() {
            var elements = $.unique(sourceElements.concat(targetElements));
            elements.forEach(function(element) {
                that.remove(element);
            });
        };
    }

    // module/private exports
    cornerstoneTools.Synchronizer = Synchronizer;

})($, cornerstone, cornerstoneTools);
