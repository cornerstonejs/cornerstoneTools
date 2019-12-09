# Introduction

## What is CornerstoneTools.js {#what-is-cornerstone-tools-js}

Cornerstone Tools is a JavaScript library that assists in annotating, segmenting, and measuring medical images. This library also provides a framework for creating new tools, managing all tools in a consistent, cohesive manner, and importing/exporting tool measurement data.

This library is not stand-alone. It builds on top of [Cornerstone](https://cornerstonejs.org/); a standards compliant, fast, and extensible JavaScript library that displays interactive medical images.

## Getting Started {#getting-started}

The easiest way to try out Cornerstone Tools is using the [JSFiddle Hello World example](https://jsfiddle.net/dannyrb/csnj2tbq/). Feel free to open it in another tab and follow along as we go through some basic examples. Or, you can [create an `index.html` file](https://gist.githubusercontent.com/dannyrb/63e5f4e76711f8539aea934357344e21/raw/1902fa0ecf7b764ca0011c7d03072f19156b4f93/Cornerstone%2520Tools%2520v3%2520-%2520Hello%2520World) and include Cornerstone Tools with:

```html
<!-- Dependencies -->
<script src="https://cdn.jsdelivr.net/npm/hammerjs@2.0.8"></script>
<script src="https://cdn.jsdelivr.net/npm/cornerstone-math@0.1.6/dist/cornerstoneMath.js"></script>
<script src="https://cdn.jsdelivr.net/npm/cornerstone-core@2.2.4/dist/cornerstone.js"></script>
<script src="https://cdn.jsdelivr.net/npm/cornerstone-web-image-loader@2.1.0/dist/cornerstoneWebImageLoader.js"></script>

<!-- development version, includes helpful console warnings -->
<script src="https://cdn.jsdelivr.net/npm/cornerstone-tools@3.0.0-b.641/dist/cornerstoneTools.js"></script>
```

or:

```html
<!-- Dependencies -->
<script src="https://cdn.jsdelivr.net/npm/hammerjs@2.0.8"></script>
<script src="https://cdn.jsdelivr.net/npm/cornerstone-math@0.1.6"></script>
<script src="https://cdn.jsdelivr.net/npm/cornerstone-core@2.2.4"></script>
<script src="https://cdn.jsdelivr.net/npm/cornerstone-web-image-loader@2.1.0"></script>

<!-- production version, optimized for size and speed -->
<script src="https://cdn.jsdelivr.net/npm/cornerstone-tools@next"></script>
```

The [Installation page](installation.md) provides more options for installing Cornerstone Tools.

### Dependencies

If you find the dependencies confusing, here is a high level overview of why each is included and necessary for Cornerstone Tools to function:

| Dependency                   | Purpose                                                                                                                                             | Alternatives                                                                                                                                                                                             |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hammer.js                    | Adds cross-browser support for touch events and gestures                                                                                            | N/A                                                                                                                                                                                                      |
| Cornerstone Math             | Is a dependency some tools use to aid in vector math, or other complex operations                                                                   | N/A                                                                                                                                                                                                      |
| Cornerstone (Core)           | Renders our image, and provides useful events and methods to make tools that respond to viewport changes possible                                   | N/A                                                                                                                                                                                                      |
| Cornerstone Web Image Loader | Adds the ability to "fetch" PNG / JPEG images from `http` or `https` URLs. Other image loaders exist to load NIFTI or DICOM images into Cornerstone | [CornerstoneWADOImageLoader](https://github.com/cornerstonejs/cornerstoneWADOImageLoader) (DICOM) / [CornerstoneNIFTIImageLoader](https://github.com/flywheel-io/cornerstone-nifti-image-loader) (NIFTI) |

If you find this overly complicated and have alternative solutions to managing and using dependencies, we are always looking for new ideas on how to simplify the process. Please do not hesitate to create a [GitHub issue](https://github.com/cornerstonejs/cornerstoneTools/issues) and discuss (:

## Configuration {#configuration}

Previous versions of Cornerstone Tools required a strong knowledge of its internals to enable/disable different features and functionality. Now, sensible defaults are applied when you initialize a new instance of Cornerstone Tools. You also have the ability to override those defaults, for example:

_To disable touch event listeners:_

```js
const config = {
  touchEnabled: false,
};
const csTools = cornerstoneTools.init(config);
```

A full list of the settings and their defaults can be found here: [globalConfigurationModule.js](https://github.com/cornerstonejs/cornerstoneTools/blob/master/src/store/modules/globalConfigurationModule.js#L1-L5)

## Adding and Using Tools {#adding-and-using-tools}

In previous versions of Cornerstone Tools, users would need to implement their own Tool manager. This version includes the concept of "adding" Tools to `Enabled` elements to make tracking and managing Tool state across your application easier.

### _Adding a Tool to one or more `Enabled` elements:_

In this example, we're adding a built in Tool to an `Enabled` element.

```js
const csTools = cornerstoneTools.init();
const LengthTool = cornerstoneTools.LengthTool;

// Make sure we have at least one element Enabled
const element = document.querySelector('#element-1');
cornerstone.enable(element);

// Adds tool to ALL currently Enabled elements
csTools.addTool(LengthTool);

// OR add the tool to a specific Enabled element
csTools.addToolForElement(element, LengthTool);
```

### _Activating an added Tool:_

When a Tool is added, its default [mode](anatomy-of-a-tool/index.md#modes) is `Disabled`. When a Tool's mode is `Active`, it can be used; if it has measurement data, that data can be created or interacted with. You can read more about changing a Tool's mode in the [anatomy of a tool](anatomy-of-a-tool/index.md#modes) section of our docs. In this example, we change an added Tool's mode to `Active`:

```js
// Activate the tool for ALL currently Enabled elements
csTools.setToolActive(LengthTool.name, { mouseButtonMask: 1 });

// OR activate the tool for a specific Enabled element
csTools.setToolActiveForElement(enabledElement, LengthTool.name, {
  mouseButtonMask: 1,
});
```

Now that our Tool is `Active`, we should be able to use our `LengthTool` to draw length annotations on the `Enabled` element. Having trouble or just want to see a quick demo? [Check out this jsfiddle!](https://jsfiddle.net/dannyrb/jhxdgu94/)

## Next Steps {#next-steps}

_This section needs content_
