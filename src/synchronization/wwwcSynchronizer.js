// This function synchronizes the target element ww/wc to match the source element
export default function(synchronizer, sourceElement, targetElement) {

    // ignore the case where the source and target are the same enabled element
    if (targetElement === sourceElement) {
        return;
    }
    // get the source and target viewports
    const sourceViewport = cornerstone.getViewport(sourceElement);
    const targetViewport = cornerstone.getViewport(targetElement);

    // do nothing if the ww/wc already match
    if (targetViewport.voi.windowWidth === sourceViewport.voi.windowWidth && targetViewport.voi.windowCenter === sourceViewport.voi.windowCenter && targetViewport.invert === sourceViewport.invert) {
        return;
    }

    // www/wc are different, sync them
    targetViewport.voi.windowWidth = sourceViewport.voi.windowWidth;
    targetViewport.voi.windowCenter = sourceViewport.voi.windowCenter;
    targetViewport.invert = sourceViewport.invert;
    synchronizer.setViewport(targetElement, targetViewport);
}