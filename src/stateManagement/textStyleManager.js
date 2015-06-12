var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function textStyleManager() {
        var defaultFontSize = 15,
            defaultFont = defaultFontSize + "px Arial";

        function setFont(font){
            defaultFont = font;
        }
        function getFont(){
            return defaultFont;
        }

        function setFontSize(fontSize){
            defaultFontSize = fontSize;
        }
        function getFontSize(){
            return defaultFontSize;
        }
      
        var textStyle = {
            setFont: setFont,
            getFont: getFont,
            setFontSize: setFontSize,
            getFontSize: getFontSize
        };

        return textStyle;
    }

    // module/private exports
    cornerstoneTools.textStyle = textStyleManager();

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
