(function (cs) {

    "use strict";

    function createTextPixelData(l, bg){
        bg = (bg === undefined?'#222':bg);
        var canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, 256, 256);
        ctx.font = "48px courier";
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'white';
        ctx.strokeText(''+l, 50, 100);
        var RgbaPixelData = ctx.getImageData(0,0,256,256).data;
        var RedPiexelData = RgbaPixelData.filter((p,i)=>i%4===0);
        return RedPiexelData;
    }

    // imageId should be // example-n://<label>:<bg-color>
    function getTextImage(imageId) {

        var width = 256;
        var height = 256;

        var tokens = imageId.substring(12).split(':');
        var l = tokens[0];
        var bg = tokens[1];
        var pixelData = createTextPixelData(l, bg);
        function getPixelData(){
            return pixelData;
        }

        var image = {
            imageId: imageId,
            minPixelValue : 0,
            maxPixelValue : 257,
            slope: 1.0,
            intercept: 0,
            windowCenter : 127,
            windowWidth : 256,
            render: cs.renderGrayscaleImage,
            getPixelData: getPixelData,
            rows: height,
            columns: width,
            height: height,
            width: width,
            color: false,
            columnPixelSpacing: 1.0,
            rowPixelSpacing: 1.0,
            invert: false,
            sizeInBytes: width * height
        };

        var deferred = $.Deferred();
        deferred.resolve(image);
        return deferred;
    }

    // register our imageLoader plugin with cornerstone
    cs.registerImageLoader('example-n', getTextImage);

}(cornerstone));