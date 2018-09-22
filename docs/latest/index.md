# Introduction

{% include "./partials/beta-warning.md" %}

## What is CornerstoneTools.js {#what-is-cornerstone-tools-js}

Cornerstone Tools is a javascript library that assist in annotating, segmenting, and measuring medical images. This library also provides a framework for creating new tools, managing all tools in a consistent cohesive manner, and importing/exporting tool measurement data.

This library is not stand-alone. It builds on top of [Cornerstone](https://cornerstonejs.org/); a standards compliant, fast, and extensible JavaScript library that displays interactive medical images.

## Getting Started {#getting-started}

The easiest way to try out Cornerstone Tools is using the [JSFiddle Hello World example](https://jsfiddle.net/dannyrb/eujoLcn6/). Feel free to open it in another tab and follow along as we go through some basic examples. Or, you can [create an `index.html` file](https://gist.githubusercontent.com/dannyrb/63e5f4e76711f8539aea934357344e21/raw/1902fa0ecf7b764ca0011c7d03072f19156b4f93/Cornerstone%2520Tools%2520v3%2520-%2520Hello%2520World) and include Cornerstone Tools with:

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

If you find this overly complicated and have alternative solutions to managing and using dependencies, we are always looking for new ideas on how to simplify the process. Please do not hesitate to create a GitHub issue and discuss (:

## Configuration {#configuration}

_This section needs content_

## Adding and Using Tools {#adding-and-using-tools}

_This section needs content_

## Next Steps {#next-steps}

_This section needs content_
