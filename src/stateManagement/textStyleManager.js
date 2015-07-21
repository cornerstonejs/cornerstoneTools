(function(cornerstoneTools) {

    'use strict';

    function textStyleManager() {
        var defaultFontSize = 15,
            defaultFont = defaultFontSize + 'px Arial',
            defaultBackgroundColor = 'transparent';

        function setFont(font) {
            defaultFont = font;
        }

        function getFont() {
            return defaultFont;
        }

        function setFontSize(fontSize) {
            defaultFontSize = fontSize;
        }

        function getFontSize() {
            return defaultFontSize;
        }

        function setBackgroundColor(backgroundColor) {
            defaultBackgroundColor = backgroundColor;
        }

        function getBackgroundColor() {
            return defaultBackgroundColor;
        }

        var textStyle = {
            setFont: setFont,
            getFont: getFont,
            setFontSize: setFontSize,
            getFontSize: getFontSize,
            setBackgroundColor: setBackgroundColor,
            getBackgroundColor: getBackgroundColor
        };

        return textStyle;
    }

    // module/private exports
    cornerstoneTools.textStyle = textStyleManager();

})(cornerstoneTools);
