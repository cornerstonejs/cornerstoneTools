export default function(which, mouseButtonMask) {
    /*jshint bitwise: false*/
    const mouseButton = (1 << (which - 1));
    return ((mouseButtonMask & mouseButton) !== 0);
}