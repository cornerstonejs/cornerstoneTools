---
layout: tool-simple
title: Lenght Tool
toolName: Length
---

## How to set up the {{page.toolName}} tool:

{% highlight javascript %}
// Init cornerstone tools
cornerstoneTools.init();

// Enable any elements, and display images
// ...

// Add our tool, and set it's mode
const {{page.toolName}}Tool = cornerstoneTools.{{page.toolName}}Tool;

cornerstoneTools.addTool({{page.toolName}}Tool)
cornerstoneTools.setToolActive('{{page.toolName}}', { mouseButtonMask: 1 })
{% endhighlight %}
