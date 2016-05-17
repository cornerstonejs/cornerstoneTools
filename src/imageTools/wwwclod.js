(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function mouseUpCallback(e, eventData) {
        $(eventData.element).off('CornerstoneToolsMouseDrag', mouseDragCallback);
        $(eventData.element).off('CornerstoneToolsMouseUp', mouseUpCallback);
        $(eventData.element).off('CornerstoneToolsMouseClick', mouseUpCallback);
        interactionEnd(e, eventData);
    }

    function mouseDownCallback(e, eventData) {
        if (cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            interactionStart(e, eventData);
            $(eventData.element).on('CornerstoneToolsMouseDrag', mouseDragCallback);
            $(eventData.element).on('CornerstoneToolsMouseUp', mouseUpCallback);
            $(eventData.element).on('CornerstoneToolsMouseClick', mouseUpCallback);
            return false; // false = causes jquery to preventDefault() and stopPropagation() this event
        }
    }

    function defaultStrategy(eventData) {
        // here we normalize the ww/wc adjustments so the same number of on screen pixels
        // adjusts the same percentage of the dynamic range of the image.  This is needed to
        // provide consistency for the ww/wc tool regardless of the dynamic range (e.g. an 8 bit
        // image will feel the same as a 16 bit image would)
        var maxVOI = eventData.image.maxPixelValue * eventData.image.slope + eventData.image.intercept;
        var minVOI = eventData.image.minPixelValue * eventData.image.slope + eventData.image.intercept;
        var imageDynamicRange = maxVOI - minVOI;
        var multiplier = imageDynamicRange / 1024;

        var deltaX = eventData.deltaPoints.page.x * multiplier;
        var deltaY = eventData.deltaPoints.page.y * multiplier;

        eventData.viewport.voi.windowWidth += (deltaX);
        eventData.viewport.voi.windowCenter += (deltaY);
    }

    function mouseDragCallback(e, eventData) {
        cornerstoneTools.wwwclod.strategy(eventData);
        cornerstone.setViewport(eventData.element, eventData.viewport);
        return false; // false = cases jquery to preventDefault() and stopPropagation() this event
    }

    function interactionStart(e, eventData) {

        var config = cornerstoneTools.wwwclod.getConfiguration();
        var target_width = 256;
        var target_height = 256;

        if (config){
          if(config.target_width){
            target_width = config.target_width;
          }
          if (config.target_height){
            target_height = config.target_height;            
          }
        }
        if ((eventData.image.height < (target_height*1.5)) && (eventData.image.width < (target_width*1.5))){
            var orig_data = {unchanged : true};
            cornerstoneTools.addToolState(eventData.element,"wwwclod",orig_data);
            return;
        }
        var image = eventData.image;
        var viewport = eventData.viewport;
        var enabledElement = cornerstone.getEnabledElement(eventData.element);
        var canvas = $(eventData.element).find('canvas').get(0);
        var canvas_width = canvas.width;
        var canvas_height = canvas.height;
        var translation_down_x = 0 ;
        var translation_down_y = 0 ;

        var i_transform = cornerstone.internal.getTransform(enabledElement);
        i_transform.invert();
        var bottom_right = i_transform.transformPoint(canvas_width, canvas_height);
        bottom_right.x = Math.min(bottom_right.x, image.width);
        bottom_right.y = Math.min(bottom_right.y, image.height);

        var top_left = i_transform.transformPoint(0, 0);
        if (top_left.x<0){
          translation_down_x = -1*top_left.x*viewport.scale;
        }
        if (top_left.y<0){
          translation_down_y = -1*top_left.y*viewport.scale;
        }
        top_left.x = Math.max(0, top_left.x);
        top_left.y = Math.max(0, top_left.y);

        var orig_data = {image : image, scale : viewport.scale, translation: viewport.translation};
        cornerstoneTools.addToolState(eventData.element,"wwwclod",orig_data);

        // console.log(top_left);
        // console.log(bottom_right);
        var down_image=downsample_image(image, target_width, target_height, top_left, bottom_right);

        var cnst_element = cornerstone.getEnabledElement(eventData.element);
        cornerstone.displayImage(eventData.element, down_image, cnst_element.viewport);
        if(down_image.rowPixelSpacing < down_image.columnPixelSpacing) {
            viewport.scale = viewport.scale*((bottom_right.y - top_left.y) / (target_height));
            translation_down_x += -1*(canvas_width-down_image.width*viewport.scale*down_image.columnPixelSpacing/down_image.rowPixelSpacing)/2;
            translation_down_y += -1*(canvas_height-down_image.height*viewport.scale)/2;
        }
        else{;
            viewport.scale = viewport.scale*((bottom_right.x - top_left.x) / (target_width));
            translation_down_x += -1*(canvas_width-down_image.width*viewport.scale)/2;
            translation_down_y += -1*(canvas_height-down_image.height*viewport.scale*down_image.rowPixelSpacing/down_image.columnPixelSpacing)/2;
        }

        viewport.translation = {
          x : translation_down_x/viewport.scale,
          y : translation_down_y/viewport.scale
        };
        cornerstone.setViewport(eventData.element, viewport);
        return false; // false = cases jquery to preventDefault() and stopPropagation() this event
    }

    function interactionEnd(e, eventData){
      var orig_data = cornerstoneTools.getToolState(eventData.element,"wwwclod").data[0];
      if ('unchanged' in orig_data){
        cornerstoneTools.clearToolState(eventData.element,"wwwclod");
        return;
      }
      cornerstoneTools.clearToolState(eventData.element,"wwwclod");
      var orig_image = orig_data.image;
      var cnst_element = cornerstone.getEnabledElement(eventData.element);
      var viewport = eventData.viewport;
      viewport.scale = orig_data.scale;
      viewport.translation = orig_data.translation;
      cornerstone.displayImage(eventData.element, orig_image, cnst_element.viewport);
      cornerstone.setViewport(eventData.element, viewport);
    }

    function downsample_image(image, target_width, target_height, top_left, bottom_right){
      var image_data=image.getPixelData();
      var img_width = image.width;
      var img_height = image.height;
      var offset_y=top_left.y;
      var offset_x=top_left.x;
      var stride_y=(bottom_right.y - top_left.y)/target_height;
      var stride_x=(bottom_right.x - top_left.x)/target_width;

      function get_pixels(){
        if (!image.color){
          var arr = new image_data.constructor(target_height*target_width);
          var i2,j2;
          for (var i=0; i<target_height; i++){
            for (var j=0; j < target_width; j++){
              i2 =  Math.ceil(offset_y + (i+0.5)*stride_y);
              j2 =  Math.ceil(offset_x + (j+0.5)*stride_x);
              arr[i*target_width+j]=image_data[i2*img_width+j2];
            }
          }
          return arr;
        }
      else{
        var arr = new image_data.constructor(target_height*target_width*4);
        var i2,j2;
        for (var i=0; i<target_height; i++){
          for (var j=0; j < target_width; j++){
            i2 =  Math.ceil(offset_y + (i+0.5)*stride_y);
            j2 =  Math.ceil(offset_x + (j+0.5)*stride_x);
            arr[4*(i*target_width+j)+0]=image_data[4*(i2*img_width+j2)+0];
            arr[4*(i*target_width+j)+1]=image_data[4*(i2*img_width+j2)+1];
            arr[4*(i*target_width+j)+2]=image_data[4*(i2*img_width+j2)+2];
            arr[4*(i*target_width+j)+3]=image_data[4*(i2*img_width+j2)+3];
          }
        }
        return arr;
        }
      }

      var image_2 = {
        imageId: image.imageId+"_down",
        minPixelValue: image.minPixelValue,
        maxPixelValue: image.maxPixelValue,
        rows: target_height,
        columns: target_width,
        height: target_height,
        width: target_width,
        getPixelData: get_pixels,
        color: image.color,
        columnPixelSpacing: (image.columnPixelSpacing?image.columnPixelSpacing:1)/stride_y,
        rowPixelSpacing: (image.rowPixelSpacing?image.rowPixelSpacing:1)/stride_x,
        invert: false,
        sizeInBytes: target_width * target_height * 2 * (image.color?1:4),
        render: image.render,
        slope: image.slope,
        intercept: image.intercept,
        windowCenter: image.windowCenter,
        windowWidth: image.windowWidth
      }
      return image_2;
    }

    cornerstoneTools.wwwclod = cornerstoneTools.simpleMouseButtonTool(mouseDownCallback);
    cornerstoneTools.wwwclod.strategies = {
        default: defaultStrategy
    };
    cornerstoneTools.wwwclod.strategy = defaultStrategy;

})($, cornerstone, cornerstoneTools);
