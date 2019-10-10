---
layout: segmentation-tool
title: Brush Tool
toolName: Brush
toolType: segmentation
---

<h3 class="title is-3">Setup</h3>

This example shows how to enable the brush tool, but not all of its features. A more verbose example will likely be created following our upcoming breaking brush changes as part of Cornerstone Tools Version 4.

<!-- prettier-ignore-start -->

{% highlight javascript %}
const element = document.querySelector('.cornerstone-element');

// Init CornerstoneTools
cornerstoneTools.init();
cornerstone.enable(element);

const toolName = 'Brush';
const imageId = 'wadouri:https://example.com/assets/dicom/bellona/chest_lung/1.dcm';

// Display our Image
cornerstone.loadImage(imageId).then(function(image) {
  cornerstone.displayImage(element, image);
});

// Add the tool
const apiTool = cornerstoneTools[`${toolName}Tool`];
cornerstoneTools.addTool(apiTool);
cornerstoneTools.setToolActive(toolName, { mouseButtonMask: 1 });
{% endhighlight %}

<!-- prettier-ignore-end -->
