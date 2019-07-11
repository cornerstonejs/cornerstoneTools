---
layout: enable-tool
title: Reference Lines Tool
toolName: ReferenceLines
toolType: sync-tool
---

<h2 class="title is-3">Setup:</h2>

<section class="content">

<p>The Reference Lines tool is special in that it is an "Overlay Tool". Which means that it really only has two states: <code>Enabled</code> and <code>Disabled</code>. This tool can be tricky to set up because it requires passing a synchronizer in a <code>synchronizatioContext</code> as an option when first enabling the tool. We attempt to draw a reference line for each of the synchronizer's <code>sourceElements</code>.</p>

<p>The synchronizer, when used with the <code>updateImageSynchronizer</code> function, has the added benefit of triggering redraws on the synchronizer's <code>targetElements</code> when a <code>sourceElement</code> is updated. This is how one element is able to update it's referenceLine in response to a new image on a different element.</p>

</section>

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
    cornerstoneTools.addTool(cornerstoneTools.ReferenceLinesTool);
    cornerstoneTools.setToolEnabled('ReferenceLines', {
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

function addReferenceLinesTool(){
  const synchronizer = new cornerstoneTools.Synchronizer(
    'cornerstonenewimage',
    cornerstoneTools.updateImageSynchronizer
  );

  // These have to be added to our synchronizer before we pass it to our tool
  synchronizer.add(firstElement);
  synchronizer.add(secondElement);

  cornerstoneTools.addTool(cornerstoneTools.ReferenceLinesTool);
  cornerstoneTools.setToolEnabled('ReferenceLines', {
    synchronizationContext: synchronizer,
  });
}

const handleImageRendered = (evt) => {
  evt.detail.element.removeEventListener('cornerstoneimagerendered', handleImageRendered)

  numImagesLoaded++;
  if(numImagesLoaded === 2){
    addReferenceLinesTool();
  }
}
firstElement.addEventListener('cornerstoneimagerendered', handleImageRendered)
secondElement.addEventListener('cornerstoneimagerendered', handleImageRendered)

</script>
