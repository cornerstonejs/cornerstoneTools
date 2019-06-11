---
layout: stack-tool
title: Custom Segmentation Colors
toolName: Brush
toolType: brush
---

<div class="buttons">
  <button id="next-seg" class="button">
    Next Segmentation
  </button>
  <button id="previous-seg" class="button">
    Previous Segmentation
  </button>
</div>

<h3 class="title is-3">Setup</h3>

<!-- prettier-ignore-start -->

{% highlight javascript %}
const colorMapId = 'HelloWorld';
const colormap = cornerstone.colors.getColormap(colorMapId);
const distinctColors = [
  [255, 255, 255, 255],
  [60, 180, 175, 255],
  [255, 225, 25, 255],
  [0, 130, 200, 255],
];

colormap.setNumberOfColors(distinctColors.length);

for (let i = 0; i < distinctColors.length; i++) {
  colormap.setColor(i, distinctColors[i]);
}

cornerstoneTools.store.modules.brush.state.colorMapId = colorMapId;
{% endhighlight %}

<!-- prettier-ignore-end -->

<script>
function initCustomColorMap(){
  const colorMapId = 'HelloWorld';
  const colormap = cornerstone.colors.getColormap(colorMapId);
  const distinctColors = [
    [255, 255, 255, 255],
    [60, 180, 175, 255],
    [255, 225, 25, 255],
    [0, 130, 200, 255],
  ];

  colormap.setNumberOfColors(distinctColors.length);

  for (let i = 0; i < distinctColors.length; i++) {
    colormap.setColor(i, distinctColors[i]);
  }

  cornerstoneTools.store.modules.brush.state.colorMapId = colorMapId;
}

// UI Setup
document.getElementById('next-seg').addEventListener('click', function(){
  cornerstoneTools.store.state.tools[0].nextSegmentation();
});

document.getElementById('previous-seg').addEventListener('click', function(){
  cornerstoneTools.store.state.tools[0].previousSegmentation();
});


// Logic to fire after first image load
const handleImageRendered = (evt) => {
  evt.detail.element.removeEventListener('cornerstoneimagerendered', handleImageRendered)
  initCustomColorMap();
}

const myElement = document.getElementById('cornerstone-element');
myElement.addEventListener('cornerstoneimagerendered', handleImageRendered)
</script>
