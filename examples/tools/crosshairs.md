---
layout: enable-tool
title: Crosshairs Tool
toolName: Crosshairs
toolType: stack
---

<h2 class="title is-2">How to set up the CrosshairsTool tool:</h2>

{% highlight javascript %}
// Init cornerstone tools
cornerstoneTools.init()

const scheme = 'wadouri'
const baseUrl = 'https://mypacs.com/dicoms/'

const firstSerie = [
    'image_1.dcm'
]

const firstSeriesImageIds = firstSerie.map(seriesImage => `${scheme}:${baseUrl}$seriesImage}`

const secondSerie = [
    'image_11.dcm',
    'image_22.dcm',
    'image_33.dcm',
    'image_44.dcm'
]

const secondSeriesImageIds = secondSerie.map(seriesImage => `${scheme}:${baseUrl}$seriesImage}`

//define the stacks
const stackSeries1 = {
  currentImageIdIndex: 0,
  firstSeriesImageIds
}

const stackSeries2 = {
  currentImageIdIndex: 0,
  secondSeriesImageIds
}

// create the synchronizer
const synchronizer = new cornerstoneTools.Synchronizer(
  'cornerstonenewimage',
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

  const topgramPromise = cornerstone.loadImage(topgramImageIds[0]).then((image) => {
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
