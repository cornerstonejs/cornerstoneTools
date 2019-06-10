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

const scheme = 'wadouri'
const baseUrl = 'https://mypacs.com/dicoms/'

// Create first series stack
const firstSeries = [
  'image_1.dcm'
]

const firstSeriesImageIds = firstSeries
  .map(seriesImage => `${scheme}:${baseUrl}${seriesImage}`);

const stackSeries1 = {
  currentImageIdIndex: 0,
  firstSeriesImageIds
}

// Create second series stack
const secondSeries = [
  'image_11.dcm',
  'image_22.dcm',
  'image_33.dcm',
  'image_44.dcm'
]

const stackSeries2 = {
  currentImageIdIndex: 0,
  imageIds: secondSeries
    .map(seriesImage => `${scheme}:${baseUrl}${seriesImage}`);
}

// Create the synchronizer
const synchronizer = new cornerstoneTools.Synchronizer(
  // Cornerstone event that should trigger synchronizer
  'cornerstonenewimage',
  // Logic that should run on target elements when event is observed on source elements
  cornerstoneTools.updateImageSynchronizer
)

// load images and set the stack
const chestPromise = cornerstone.loadImage(chestImageIds[0]).then((image) => {
// display this image
cornerstone.displayImage(chestElement, image)

    // set the stack as tool state
    synchronizer.add(chestElement)
    cornerstoneTools.addStackStateManager(
      chestElement,
      ['stack', toolName]
    )
    cornerstoneTools.addToolState(chestElement, 'stack', chestStack)
})

// Add the tool
cornerstoneTools.addTool(cornerstoneTools.StackScrollTool);
cornerstoneTools.setToolActive('StackScroll', { mouseButtonMask: 1 })

cornerstoneTools.addTool(cornerstoneTools.StackScrollMouseWheelTool);
cornerstoneTools.setToolActive('StackScrollMouseWheel', { mouseButtonMask: 1 })

const topgramPromise = cornerstone.loadImage(
  topgramImageIds[0]).then((image) => {
  // display this image
  cornerstone.displayImage(topgramElement, image)
  // set the stack as tool state
  synchronizer.add(topgramElement)
  cornerstoneTools.addStackStateManager(
    topgramElement,
    ['stack', toolName]
  )
  cornerstoneTools.addToolState(topgramElement, 'stack', topgramStack)
})
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
  console.log('addCrosshairsTool')
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
