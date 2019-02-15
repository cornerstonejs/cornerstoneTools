---
layout: page
title: EllipticalRoi Tool
toolName: ellipticalRoi
htmlFile: simpleTool.html
permalink: /elliptical-roi/
---

How to set up the {{page.toolName}} tool:

{% highlight javascript %}
const cTools = cornerstoneTools.init({});
cTools.addTool('{{page.toolName}}')
{% endhighlight %}
