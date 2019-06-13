---
layout: enable-tool
title: Crosshairs Tool
toolName: Crosshairs
toolType: stack
---

<h2 class="title is-3">Setup:</h2>

It's important to note that the CrossHairs tool uses the Cornerstone MetaDataProvider to determine which slices contain our point of interest. If the metadata for the series/volume has not yet been loaded, the tool may be unable to find the most appropriate POI.

<!-- prettier-ignore-start -->
{% highlight javascript %}
// Init cornerstone tools
cornerstoneTools.init()

// ...
// Enable our elements

const scheme = 'wadouri'
const baseUrl = 'https://mypacs.com/dicoms/'

// Create our Stack data
const firstSeries = [
  'image_1.dcm'
]

const secondSeries = [
  'image_11.dcm',
  'image_22.dcm',
  'image_33.dcm',
  'image_44.dcm'
]

const firstStack = {
  currentImageIdIndex: 0,
  imageIds: firstSeries
    .map(seriesImage => `${scheme}:${baseUrl}${seriesImage}`);,
};

const secondStack = {
  currentImageIdIndex: 0,
  imageIds: secondSeries
    .map(seriesImage => `${scheme}:${baseUrl}${seriesImage}`);,
};

// Create the synchronizer
const synchronizer = new cornerstoneTools.Synchronizer(
  // Cornerstone event that should trigger synchronizer
  'cornerstonenewimage',
  // Logic that should run on target elements when event is observed on source elements
  cornerstoneTools.updateImageSynchronizer
)

// Add and activate tools
cornerstoneTools.addTool(cornerstoneTools.StackScrollTool);
cornerstoneTools.addTool(cornerstoneTools.StackScrollMouseWheelTool);
cornerstoneTools.setToolActive('StackScroll', { mouseButtonMask: 1 });
cornerstoneTools.setToolActive('StackScrollMouseWheel', { });

// load images and set the stack
const firstLoadImagePromise = cornerstone.loadImage(firstStack.imageIds[0])
  .then((image) => {
    cornerstone.displayImage(firstElement, image)

    // set the stack as tool state
    synchronizer.add(firstElement)
    cornerstoneTools.addStackStateManager(firstStack, ['stack', 'Crosshairs'])
    cornerstoneTools.addToolState(firstElement, 'stack', firstStack)
  })

const secondLoadImagePromise = cornerstone.loadImage(secondStack.imageIds[0])
  .then((image) => {
    cornerstone.displayImage(secondElement, image)

    // set the stack as tool state
    synchronizer.add(secondElement);
    cornerstoneTools.addStackStateManager(secondElement, ['stack', 'Crosshairs']);
    cornerstoneTools.addToolState(secondElement, 'stack', secondStack);
  })

// After images have loaded, and our sync context has added both elements
Promise.all([firstLoadImagePromise, secondLoadImagePromise])
  .then(() => {
    const tool = cornerstoneTools.CrosshairsTool;

    cornerstoneTools.addTool(tool);
    cornerstoneTools.setToolActive('Crosshairs', {
      mouseButtonMask: 1,
      synchronizationContext: synchronizer,
    });
  });
{% endhighlight %}
<!-- prettier-ignore-end -->

<script>
// Doing some dark magic here to make sure we don't add our
// synchronizer/tool until all canvases have rendered an image.
let canvasesReady = false;
let numImagesLoaded = 0;
const firstElement = document.getElementById('topgram_element');
const secondElement = document.getElementById('chest_element');

function addCrosshairsTool(){
  const synchronizer = new cornerstoneTools.Synchronizer(
    'cornerstonenewimage',
    cornerstoneTools.updateImageSynchronizer
  );

  // These have to be added to our synchronizer before we pass it to our tool
  synchronizer.add(firstElement);
  synchronizer.add(secondElement);
  const tool = cornerstoneTools.CrosshairsTool;

  cornerstoneTools.addTool(tool);
  cornerstoneTools.setToolActive('Crosshairs', {
    mouseButtonMask: 1,
    synchronizationContext: synchronizer,
  });
}

const handleImageRendered = (evt) => {
  evt.detail.element.removeEventListener('cornerstoneimagerendered', handleImageRendered)

  numImagesLoaded++;
  if(numImagesLoaded === 2){
    addCrosshairsTool();
  }
}
firstElement.addEventListener('cornerstoneimagerendered', handleImageRendered)
secondElement.addEventListener('cornerstoneimagerendered', handleImageRendered)

</script>
