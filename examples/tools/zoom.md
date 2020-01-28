---
layout: tool-simple
title: Zoom Tool
toolName: Zoom
toolType: general
---

<!-- prettier-ignore-start -->
{% highlight javascript %}
// Init cornerstone tools
cornerstoneTools.init();

// Enable any elements, and display images
// ...

// Add our tool, and set it's mode
const ZoomTool = cornerstoneTools.ZoomTool;

cornerstoneTools.addTool(cornerstoneTools.ZoomTool, {
  // Optional configuration
  configuration: {
    invert: false,
    preventZoomOutsideImage: false,
    minScale: .1,
    maxScale: 20.0,
  }
});

cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 1 })
{% endhighlight %}
<!-- prettier-ignore-end -->

<script>
const myElement = document.getElementById('cornerstone-element');

const handleImageRendered = (evt) => {
  evt.detail.element.removeEventListener('cornerstoneimagerendered', handleImageRendered)

  // We're adding this tool in the boilerplate;
  // So we use this to remove it, and re-add with our desired config
  cornerstoneTools.removeTool('Zoom')
  cornerstoneTools.addTool(cornerstoneTools.ZoomTool, {
    configuration: {
      invert: false,
      preventZoomOutsideImage: false,
      minScale: .1,
      maxScale: 20.0,
    }
  });
  cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 1 })
}

myElement.addEventListener('cornerstoneimagerendered', handleImageRendered)
</script>
