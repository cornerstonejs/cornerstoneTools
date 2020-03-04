<div align="center">
<h1>videahealth/cornerstone-tools</h1>

<p>Provides a simple, extensible framework for creating tools on top of <a href="https://github.com/cornerstonejs/cornerstone/">Cornerstone.js</a>. Includes common tool implementations, and leverages DICOM metadata (when available) for advanced functionality.</p>

[**Read The Docs**](https://tools.cornerstonejs.org/) | [Edit the docs](https://github.com/cornerstonejs/cornerstoneTools/edit/master/docs/)

<p>Per VideaHealth specifications, a few changes are made to support: 1. Hiding metrics as annotations are drawn, and 2. Disabling the mobile drawing offset.</p>

</div>

<hr />

<!-- prettier-ignore-start -->
[![Build Status][build-badge]][build]
[![Coverage Status][coverage-badge]][coverage]
[![All Contributors](https://img.shields.io/badge/all_contributors-31-orange.svg?style=flat-square)](#contributors)

[![NPM version][npm-version-image]][npm-url]
[![NPM downloads][npm-downloads-image]][npm-url]
[![MIT License][license-image]][license-url]
<!-- prettier-ignore-end -->

## Index

### The Fun Stuff

- [TOOL EXAMPLES](https://tools.cornerstonejs.org/examples/)
  - [Create or Update an Example](https://github.com/cornerstonejs/cornerstoneTools/tree/master/examples)

### Everything Else

- [Installing](#installation)
- [Examples & Docs](#examples--docs)
- [Contributing][contributing]

## The problem

Building one or two tools on top of [Cornerstone.js](https://github.com/cornerstonejs/cornerstone/) is not that difficult. However, as the number of tools grow, you begin to encounter difficult problems:

- Tools should behave and be configurable in a consistant way
- Managing tools across multiple cornerstone `enabled element`s
- Tools that need knowledge of a fellow tool's state
- The ability to "drop-in" others' tools, and they "just work"
- and many others

This library solves these problems in a highly pluggable and extensible way.

## This solution

`cornerstone-tools` is a light-weight solution for building Tools on top of Cornerstone.js. It's only dependencies are libraries within the Cornerstone family. Instead of trying to "do everything" it aims to be extensible and pluggable to aid in the rapid development of new tools. Ideally, tools created using `cornerstone-tools` can be easily shared, allowing for the creation of a broader ecosystem.

## Example

Below is a simplified example of creating a tool by extending `cornerstone-tool`'s `BaseTool` class.

```javascript
import cornerstone from 'cornerstone-core';
import { BaseTool } from 'cornerstone-tools';
import basicLevelingStrategy from '...';

export default class WwwcTool extends BaseTool {
  constructor(configuration = {}) {
    const defaultConfig = {
      name: 'Wwwc',
      strategies: { basicLevelingStrategy },
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {
        orientation: 0,
      },
    };
    const initialConfiguration = Object.assign(defaultConfig, configuration);

    super(initialConfiguration);
  }

  mouseDragCallback(evt) {
    this.applyActiveStrategy(evt);

    cornerstone.setViewport(evt.detail.element, evt.detail.viewport);
  }

  touchDragCallback(evt) {
    evt.stopImmediatePropagation();
    this.applyActiveStrategy(evt);

    cornerstone.setViewport(evt.detail.element, evt.detail.viewport);
  }
}
```

## Installation

This module is distributed via [npm][npm-url] which is bundled with [node][node] and
should be installed as one of your project's `dependencies`:

```js
// To install the newest version
npm install --save cornerstone-tools

// To install the legacy version (2.4.x branch)
npm install --save cornerstone-tools@2
```

This library has `peerDependencies` listings for:

- `hammerjs` - Better touch support
- `cornerstone-core`
- `cornerstone-math` - Simplifies and provides shared complex tool math logic
- Any Cornerstone "Image Loader"
  - `cornerstone-web-image-loader` - JPEG/PNG images
  - `cornerstone-wado-image-loader` - DICOM images; also parses tags for tool use

If you need to support the `IE11` Browser, you will need to provide polyfills as needed. Our BrowserList target:

[**Read The Docs**](https://tools.cornerstonejs.org/) | [Edit the docs](https://github.com/cornerstonejs/cornerstoneTools/edit/master/docs/)

<p>Changes have been made to support: 1. Hiding metrics as annotations are drawn, disabling the mobile drawing offset, and hiding the handles (changing the default configuration value).</p>

<h3>Deployment Steps</h3>
<p>
  Run the build, commit the changes (update package.json to reflect the new version), and then create a release tag on Github with the version you would like. For example, 4.12.2-b. The base `x.y.z-l` follows CornerstoneTools' semantic versioning for `x.y.z`, with `l` representing the corresponding letter for how many changes have been made since the `x.y.z` release.
</p>

</div>
