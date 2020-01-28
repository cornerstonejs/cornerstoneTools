---
layout: tool-simple
title: Text Marker Tool
toolName: TextMarker
toolType: annotation
---

<h2 class="title is-2">How to set up the {{page.toolName}} tool:</h2>

{% highlight javascript %}
// Init cornerstone tools
cornerstoneTools.init();

// Enable any elements, and display images
// ...

// Add our tool, and set it's mode
const {{page.toolName}}Tool = cornerstoneTools.{{page.toolName}}Tool

// set up the markers configuration

const configuration = {
  markers: ['F5', 'F4', 'F3', 'F2', 'F1'],
  current: 'F5',
  ascending: true,
  loop: true,
}

cornerstoneTools.addTool({{page.toolName}}Tool, { configuration })
cornerstoneTools.setToolActive('{{page.toolName}}', { mouseButtonMask: 1 })

{% endhighlight %}

<script>

  document.addEventListener("DOMContentLoaded", (event) => {
    const textMarkerTools = cornerstoneTools.store.state.tools.find((tool) => tool.name === 'TextMarker')

    textMarkerTools.configuration.markers = ['F5', 'F4', 'F3', 'F2', 'F1']
    textMarkerTools.configuration.current = 'F5'
    textMarkerTools.configuration.ascending = true
    textMarkerTools.configuration.loop = true
  })

</script>
