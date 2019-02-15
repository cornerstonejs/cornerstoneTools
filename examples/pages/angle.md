---
layout: page
title: Angle Tool
toolName: angle
htmlFile: simpleTool.html
permalink: /angle/
---

How to set up the {{page.toolName}} tool:

{% highlight javascript %}
const cTools = cornerstoneTools.init({});
cTools.addTool('{{page.toolName}}')
{% endhighlight %}
