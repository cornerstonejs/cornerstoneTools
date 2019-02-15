---
layout: page
title: Lenght Tool
toolName: length
htmlFile: simpleTool.html
permalink: /length/
---

How to set up the {{page.toolName}} tool:

{% highlight javascript %}
const cTools = cornerstoneTools.init({});
cTools.addTool('{{page.toolName}}')
{% endhighlight %}
