---
layout: stack-tool
title: Stack Scroll Tool
toolName: StackScroll
toolType: stack
---


<h2 class="title is-2">How to set up the {{page.toolName}} tool:</h2>

{% highlight javascript %}
// Init cornerstone tools
cornerstoneTools.init()

// Enable any elements, and display images
const imageIds = [`image_id_1`,`image_id_2`,]
// ...

// Add our tool, and set it's mode
const {{page.toolName}}Tool = cornerstoneTools.{{page.toolName}}Tool

//define the stack
const stack = {
  currentImageIdIndex: 0,
  imageIds: imageIds,
}

// load images and set the stack
cornerstone.loadImage(imageIds[0]).then((image) => {
  cornerstone.displayImage(element, image)
  cornerstoneTools.addStackStateManager(element, ['stack'])
  cornerstoneTools.addToolState(element, 'stack', stack)
})

cornerstoneTools.addTool({{page.toolName}}Tool)
cornerstoneTools.setToolActive('{{page.toolName}}', { mouseButtonMask: 1 })

{% endhighlight %}
