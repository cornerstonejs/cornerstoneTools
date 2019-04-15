---
layout: tool-simple
title: Crosshairs Tool
toolName: Crosshairs
toolType: stack
---

<h2 class="title is-2">How to set up the CrosshairsTool tool:</h2>

{% highlight javascript %}
// Init cornerstone tools
cornerstoneTools.init()

// used to determine which image loader we use to load the image.
const scheme = 'wadouri'
const baseUrl = 'https://mypacs.com/dicoms/'
const series = [
    'image_1.dcm',
    'image_2.dcm'
]

const imageIds = series.map(seriesImage => `${scheme}:${baseUrl}${seriesImage}`

// Add our tool, and set it's mode
const CrosshairsTool = cornerstoneTools.CrosshairsToolTool

//define the stack
const stack = {
  currentImageIdIndex: 0,
  imageIds
}

// load images and set the stack
cornerstone.loadImage(imageIds[0]).then((image) => {
  cornerstone.displayImage(element, image)
  cornerstoneTools.addStackStateManager(element, ['stack'])
  cornerstoneTools.addToolState(element, 'stack', stack)
})

cornerstoneTools.addTool(CrosshairsToolTool)
cornerstoneTools.setToolActive('CrosshairsTool', { mouseButtonMask: 1 })

{% endhighlight %}
