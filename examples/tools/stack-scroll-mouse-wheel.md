---
layout: stack-tool
title: Stack Scroll MouseWheel Tool
toolName: StackScrollMouseWheel
toolType: stack
---

<h2 class="title is-2">How to set up the StackScrollMouseWheel tool:</h2>

<!-- prettier-ignore-start -->
{% highlight javascript %}
// Init cornerstone tools
cornerstoneTools.init()

const scheme = 'wadouri'
const baseUrl = 'https://mypacs.com/dicoms/'
const series = [
  'image_1.dcm',
  'image_2.dcm'
]

const imageIds = series.map(seriesImage => `${scheme}:${baseUrl}${seriesImage}`

// Add our tool, and set it's mode
const StackScrollMouseWheelTool = cornerstoneTools.StackScrollMouseWheelTool

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

cornerstoneTools.addTool(StackScrollMouseWheelTool)
cornerstoneTools.setToolActive('StackScrollMouseWheel', { })

{% endhighlight %}
<!-- prettier-ignore-end -->
