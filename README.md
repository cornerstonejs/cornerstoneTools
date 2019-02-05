<div align="center">
<h1>cornerstone-tools</h1>

<p>Provides a simple, extensible framework for creating tools on top of <a href="https://github.com/cornerstonejs/cornerstone/">Cornerstone.js</a>. Includes common tool implementations, and leverages DICOM metadata (when available) for advanced functionality.</p>

[**Read The Docs**](https://tools.cornerstonejs.org/) | [Edit the docs](https://github.com/cornerstonejs/cornerstoneTools/edit/master/docs/)

</div>

<hr />

<!-- prettier-ignore-start -->
[![Build Status][build-badge]][build]
[![Coverage Status][coverage-badge]][coverage]
[![All Contributors](https://img.shields.io/badge/all_contributors-6-orange.svg?style=flat-square)](#contributors)

[![NPM version][npm-version-image]][npm-url]
[![NPM downloads][npm-downloads-image]][npm-url]
[![MIT License][license-image]][license-url]
<!-- prettier-ignore-end -->

## The problem

Building one or two tools on top of [Cornerstone.js](https://github.com/cornerstonejs/cornerstone/) is not that difficult. However, as the number of tools grow, you begin to encounter difficult problems:

- Tools should behave and be configurable in a consistant way
- Managing tools across multiple cornerstone `enabled element`s
- Tools that need knowledge of a fellow tool's state
- The ability to "drop-in" others' tools, and they "just work"
- and many others

This library attempts to solve these problems, and in a highly pluggable and extensible way.

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

This module is distributed via [npm][npm] which is bundled with [node][node] and
should be installed as one of your project's `dependencies`:

```
npm install --save cornerstone-tools
```

This library has `peerDependencies` listings for:

- `hammerjs` - Better touch support
- `cornerstone-core`
- `cornerstone-math` - Simplifies and provides shared complex tool math logic
- Any Cornerstone "Image Loader"
  - `cornerstone-web-image-loader` - JPEG/PNG images
  - `cornerstone-wado-image-loader` - DICOM images; also parses tags for tool use

If you need to support the `IE11` Browser, you will need to provide polyfills as needed.

**Setting up and configuring `cornerstone-tools`'s depency can be the biggest hurdle to getting started. Be sure to check out our docs for assistance.**

> [**Docs**](https://tools.cornerstonejs.org/installation.html)

## Examples

> The latest major version has just been published. We are still flushing out our examples. If you have anything you would like to see documented, or you want a specific example from [version 2][version-2] ported, either create an issue or make a pull request ^\_^

#### Tools

...

#### 3rd Party Tool Plugins

- Image Statistics: [Source](https://github.com/QSolutionsLLC/cornerstone-tool-image-statistics) | [Demo](https://qsolutionsllc.github.io/cornerstone-tool-image-statistics/)

## Other Solutions

- OHIF Viewer: [Source][ohif-source] | [Demo][ohif-demo]

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars2.githubusercontent.com/u/1268698?v=4" width="100px;" alt="Chris Hafey"/><br /><sub><b>Chris Hafey</b></sub>](https://www.linkedin.com/in/chafey)<br />[📖](https://github.com/Cornerstone.js/cornerstoneTools/commits?author=chafey "Documentation") [💻](https://github.com/Cornerstone.js/cornerstoneTools/commits?author=chafey "Code") [📝](#blog-chafey "Blogposts") [📢](#talk-chafey "Talks") | [<img src="https://avatars3.githubusercontent.com/u/607793?v=4" width="100px;" alt="Erik Ziegler"/><br /><sub><b>Erik Ziegler</b></sub>](https://github.com/swederik)<br />[💻](https://github.com/Cornerstone.js/cornerstoneTools/commits?author=swederik "Code") [📖](https://github.com/Cornerstone.js/cornerstoneTools/commits?author=swederik "Documentation") [👀](#review-swederik "Reviewed Pull Requests") [🚧](#maintenance-swederik "Maintenance") [🚇](#infra-swederik "Infrastructure (Hosting, Build-Tools, etc)") [💬](#question-swederik "Answering Questions") | [<img src="https://avatars1.githubusercontent.com/u/5797588?v=4" width="100px;" alt="Danny Brown"/><br /><sub><b>Danny Brown</b></sub>](http://dannyrb.com/)<br />[💻](https://github.com/Cornerstone.js/cornerstoneTools/commits?author=dannyrb "Code") [📖](https://github.com/Cornerstone.js/cornerstoneTools/commits?author=dannyrb "Documentation") [👀](#review-dannyrb "Reviewed Pull Requests") [🚧](#maintenance-dannyrb "Maintenance") [🚇](#infra-dannyrb "Infrastructure (Hosting, Build-Tools, etc)") [🔌](#plugin-dannyrb "Plugin/utility libraries") [💬](#question-dannyrb "Answering Questions") | [<img src="https://avatars0.githubusercontent.com/u/25818497?v=4" width="100px;" alt="James Petts"/><br /><sub><b>James Petts</b></sub>](https://github.com/JamesAPetts)<br />[💻](https://github.com/Cornerstone.js/cornerstoneTools/commits?author=JamesAPetts "Code") [👀](#review-JamesAPetts "Reviewed Pull Requests") [🔌](#plugin-JamesAPetts "Plugin/utility libraries") [📖](https://github.com/Cornerstone.js/cornerstoneTools/commits?author=JamesAPetts "Documentation") [💬](#question-JamesAPetts "Answering Questions") | [<img src="https://avatars0.githubusercontent.com/u/126077?v=4" width="100px;" alt="Steve Pieper"/><br /><sub><b>Steve Pieper</b></sub>](http://www.isomics.com)<br />[💬](#question-pieper "Answering Questions") [🔧](#tool-pieper "Tools") | [<img src="https://avatars3.githubusercontent.com/u/1905961?v=4" width="100px;" alt="Rodrigo Antinarelli"/><br /><sub><b>Rodrigo Antinarelli</b></sub>](https://rodrigoea.com/)<br />[💻](https://github.com/Cornerstone.js/cornerstoneTools/commits?author=rodrigolabs "Code") |
| :---: | :---: | :---: | :---: | :---: | :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

Thanks goes to these people ([emoji key][emojis]):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors][all-contributors] specification.
Contributions of any kind welcome!

## Issues

_Looking to contribute? Look for the [Good First Issue][good-first-issue]
label._

### 🐛 Bugs

Please file an issue for bugs, missing documentation, or unexpected behavior.

[**See Bugs**][bugs]

### 💡 Feature Requests

Please file an issue to suggest new features. Vote on feature requests by adding
a 👍. This helps maintainers prioritize what to work on.

[**See Feature Requests**][requests]

### ❓ Questions

For questions related to using the library, please visit our support community,
or file an issue on GitHub.

- [Google Group][google-group]

## LICENSE

MIT

<!--
Links:
-->

<!-- prettier-ignore-start -->
[build-badge]: https://circleci.com/gh/cornerstonejs/cornerstoneTools/tree/vNext.svg?style=svg
[build]: https://circleci.com/gh/cornerstonejs/cornerstoneTools/tree/vNext
[coverage-badge]: https://codecov.io/gh/cornerstonejs/cornerstoneTools/branch/vNext/graphs/badge.svg
[coverage]: https://codecov.io/gh/cornerstonejs/cornerstoneTools/branch/vNext
[npm-url]: https://npmjs.org/package/cornerstone-tools
[npm-downloads-image]: http://img.shields.io/npm/dm/cornerstone-tools.svg?style=flat
[npm-version-image]: http://img.shields.io/npm/v/cornerstone-tools.svg?style=flat
[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE
[version-2]: https://github.com/cornerstonejs/cornerstoneTools/tree/v2.4.x
[node]: https://nodejs.org
[ohif-demo]: https://viewer.ohif.org/demo-signin
[ohif-source]: https://github.com/OHIF/Viewers
[emojis]: https://github.com/kentcdodds/all-contributors#emoji-key
[all-contributors]: https://github.com/kentcdodds/all-contributors
[bugs]: https://github.com/cornerstonejs/cornerstone-tools/issues?q=is%3Aissue+is%3Aopen+label%3Abug+sort%3Acreated-desc
[requests]: https://github.com/cornerstonejs/cornerstone-tools/issues?q=is%3Aissue+sort%3Areactions-%2B1-desc+label%3Aenhancement+is%3Aopen
[good-first-issue]: https://github.com/cornerstonejs/cornerstone-tools/issues?utf8=✓&q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc+label%3A"good+first+issue"+
[google-group]: https://groups.google.com/forum/#!forum/cornerstone-platform
<!-- prettier-ignore-end -->
