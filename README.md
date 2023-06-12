## 🔔🔔🔔🔔 Attention: Cornerstone.js has evolved! We're excited to introduce [Cornerstone3D](https://github.com/cornerstonejs/cornerstone3D) 🚀. Expect advanced rendering, stellar performance, and a modern toolset. 🌐 Navigate to the new repository for the latest updates and improvements.


<div align="center">
<h1>cornerstone-tools</h1>

<p>Provides a simple, extensible framework for creating tools on top of <a href="https://github.com/cornerstonejs/cornerstone/">Cornerstone.js</a>. Includes common tool implementations, and leverages DICOM metadata (when available) for advanced functionality.</p>

[**Read The Docs**](https://tools.cornerstonejs.org/) | [Edit the docs](https://github.com/cornerstonejs/cornerstoneTools/edit/master/docs/)

</div>

<hr />

<!-- prettier-ignore-start -->
[![Build Status][build-badge]][build]
[![Coverage Status][coverage-badge]][coverage]
[![All Contributors](https://img.shields.io/badge/all_contributors-37-orange.svg?style=flat-square)](#contributors)

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

```json
  "browserslist": [
    "> 1%",
    "IE 11",
    "not dead",
    "not IE < 11",
    "not op_mini all"
  ]
```

**Setting up and configuring `cornerstone-tools`'s depency can be the biggest hurdle to getting started. Be sure to check out our docs for assistance.**

> [**Docs**](https://tools.cornerstonejs.org/installation.html)

## Examples & Docs

> The latest major version has just been published. We are still flushing out our examples. If you have anything you would like to see documented, or you want a specific example from [version 2][version-2] ported, either create an issue or make a pull request ^\_^

- [Documentation](https://tools.cornerstonejs.org)
- [Examples](https://tools.cornerstonejs.org/examples)
- [API](https://tools.cornerstonejs.org/api)

### Tools

#### Annotation Tools

- [Angle](https://tools.cornerstonejs.org/examples/tools/angle.html)
- [Elliptical ROI](https://tools.cornerstonejs.org/examples/tools/elliptical-roi.html)
- [Length](https://tools.cornerstonejs.org/examples/tools/length.html)
- [Rectangle ROI](https://tools.cornerstonejs.org/examples/tools/rectangle-roi.html)

#### 3rd Party Tool Plugins

- Image Statistics: [Source](https://github.com/QSolutionsLLC/cornerstone-tool-image-statistics) | [Demo](https://qsolutionsllc.github.io/cornerstone-tool-image-statistics/)
- Rotated Elliptical ROI Tool: [Source](https://github.com/sisobus/cornerstoneTools-RotatedEllipticalRoiTool) | [Demo](https://examples.sisobus.com/rotated-elliptical-roi/)

A huge thanks to tool authors, like @sisobus, for sharing their work with the community!

## Other Solutions

- OHIF Viewer: [Source][ohif-source] | [Demo][ohif-demo]

## Contributors

Thanks goes to these people ([emoji key][emojis]):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars2.githubusercontent.com/u/1268698?v=4" width="100px;" alt="Chris Hafey"/><br /><sub><b>Chris Hafey</b></sub>](https://www.linkedin.com/in/chafey)<br />[📖](https://github.com/cornerstonejs/cornerstoneTools/commits?author=chafey "Documentation") [💻](https://github.com/cornerstonejs/cornerstoneTools/commits?author=chafey "Code") [📝](#blog-chafey "Blogposts") [📢](#talk-chafey "Talks") | [<img src="https://avatars3.githubusercontent.com/u/607793?v=4" width="100px;" alt="Erik Ziegler"/><br /><sub><b>Erik Ziegler</b></sub>](https://github.com/swederik)<br />[💻](https://github.com/cornerstonejs/cornerstoneTools/commits?author=swederik "Code") [📖](https://github.com/cornerstonejs/cornerstoneTools/commits?author=swederik "Documentation") [👀](#review-swederik "Reviewed Pull Requests") [🚧](#maintenance-swederik "Maintenance") [🚇](#infra-swederik "Infrastructure (Hosting, Build-Tools, etc)") [💬](#question-swederik "Answering Questions") | [<img src="https://avatars1.githubusercontent.com/u/5797588?v=4" width="100px;" alt="Danny Brown"/><br /><sub><b>Danny Brown</b></sub>](http://dannyrb.com/)<br />[💻](https://github.com/cornerstonejs/cornerstoneTools/commits?author=dannyrb "Code") [📖](https://github.com/cornerstonejs/cornerstoneTools/commits?author=dannyrb "Documentation") [👀](#review-dannyrb "Reviewed Pull Requests") [🚧](#maintenance-dannyrb "Maintenance") [🚇](#infra-dannyrb "Infrastructure (Hosting, Build-Tools, etc)") [🔌](#plugin-dannyrb "Plugin/utility libraries") [💬](#question-dannyrb "Answering Questions") | [<img src="https://avatars0.githubusercontent.com/u/25818497?v=4" width="100px;" alt="James Petts"/><br /><sub><b>James Petts</b></sub>](https://github.com/JamesAPetts)<br />[💻](https://github.com/cornerstonejs/cornerstoneTools/commits?author=JamesAPetts "Code") [👀](#review-JamesAPetts "Reviewed Pull Requests") [🔌](#plugin-JamesAPetts "Plugin/utility libraries") [📖](https://github.com/cornerstonejs/cornerstoneTools/commits?author=JamesAPetts "Documentation") [💬](#question-JamesAPetts "Answering Questions") | [<img src="https://avatars0.githubusercontent.com/u/126077?v=4" width="100px;" alt="Steve Pieper"/><br /><sub><b>Steve Pieper</b></sub>](http://www.isomics.com)<br />[💬](#question-pieper "Answering Questions") [🔧](#tool-pieper "Tools") | [<img src="https://avatars3.githubusercontent.com/u/1905961?v=4" width="100px;" alt="Rodrigo Antinarelli"/><br /><sub><b>Rodrigo Antinarelli</b></sub>](https://rodrigoea.com/)<br />[💻](https://github.com/cornerstonejs/cornerstoneTools/commits?author=rodrigolabs "Code") | [<img src="https://avatars2.githubusercontent.com/u/10813109?v=4" width="100px;" alt="Zaid Safadi"/><br /><sub><b>Zaid Safadi</b></sub>](http://blog.zaidsafadi.com/)<br />[💬](#question-Zaid-Safadi "Answering Questions") [💻](https://github.com/cornerstonejs/cornerstoneTools/commits?author=Zaid-Safadi "Code") |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| [<img src="https://avatars3.githubusercontent.com/u/2378326?v=4" width="100px;" alt="Gustavo André Lelis"/><br /><sub><b>Gustavo André Lelis</b></sub>](https://github.com/galelis)<br />[💻](https://github.com/cornerstonejs/cornerstoneTools/commits?author=galelis "Code") | [<img src="https://avatars1.githubusercontent.com/u/3926071?v=4" width="100px;" alt="Kofifus"/><br /><sub><b>Kofifus</b></sub>](https://github.com/kofifus)<br />[💻](https://github.com/cornerstonejs/cornerstoneTools/commits?author=kofifus "Code") [🔧](#tool-kofifus "Tools") [🐛](https://github.com/cornerstonejs/cornerstoneTools/issues?q=author%3Akofifus "Bug reports") | [<img src="https://avatars2.githubusercontent.com/u/25580127?v=4" width="100px;" alt="Aloïs Dreyfus"/><br /><sub><b>Aloïs Dreyfus</b></sub>](http://www.linkedin.com/in/alois-dreyfus/)<br />[💻](https://github.com/cornerstonejs/cornerstoneTools/commits?author=adreyfus "Code") | [<img src="https://avatars0.githubusercontent.com/u/616382?v=4" width="100px;" alt="Tim Leslie"/><br /><sub><b>Tim Leslie</b></sub>](http://www.timl.id.au)<br />[💻](https://github.com/cornerstonejs/cornerstoneTools/commits?author=timleslie "Code") | [<img src="https://avatars3.githubusercontent.com/u/7297450?v=4" width="100px;" alt="diego0020"/><br /><sub><b>diego0020</b></sub>](https://github.com/diego0020)<br />[💻](https://github.com/cornerstonejs/cornerstoneTools/commits?author=diego0020 "Code") | [<img src="https://avatars1.githubusercontent.com/u/4920551?v=4" width="100px;" alt="Evren Ozkan"/><br /><sub><b>Evren Ozkan</b></sub>](https://github.com/evren217)<br />[💻](https://github.com/cornerstonejs/cornerstoneTools/commits?author=evren217 "Code") | [<img src="https://avatars2.githubusercontent.com/u/7647745?v=4" width="100px;" alt="Salvador Daniel Pelayo"/><br /><sub><b>Salvador Daniel Pelayo</b></sub>](https://github.com/daniel2101)<br />[💻](https://github.com/cornerstonejs/cornerstoneTools/commits?author=daniel2101 "Code") |
| [<img src="https://avatars3.githubusercontent.com/u/3358381?v=4" width="100px;" alt="Juan Narvaez"/><br /><sub><b>Juan Narvaez</b></sub>](https://github.com/jdnarvaez)<br />[💻](https://github.com/cornerstonejs/cornerstoneTools/commits?author=jdnarvaez "Code") | [<img src="https://avatars0.githubusercontent.com/u/814227?v=4" width="100px;" alt="Mike"/><br /><sub><b>Mike</b></sub>](https://github.com/mikehazell)<br />[📖](https://github.com/cornerstonejs/cornerstoneTools/commits?author=mikehazell "Documentation") [💻](https://github.com/cornerstonejs/cornerstoneTools/commits?author=mikehazell "Code") [⚠️](https://github.com/cornerstonejs/cornerstoneTools/commits?author=mikehazell "Tests") | [<img src="https://avatars2.githubusercontent.com/u/3329885?v=4" width="100px;" alt="Sangkeun Kim"/><br /><sub><b>Sangkeun Kim</b></sub>](http://sisobus.com)<br />[💻](https://github.com/cornerstonejs/cornerstoneTools/commits?author=sisobus "Code") [💬](#question-sisobus "Answering Questions") | [<img src="https://avatars3.githubusercontent.com/u/378021?v=4" width="100px;" alt="Victor Saase"/><br /><sub><b>Victor Saase</b></sub>](https://github.com/vsaase)<br />[🤔](#ideas-vsaase "Ideas, Planning, & Feedback") | [<img src="https://avatars2.githubusercontent.com/u/120943?v=4" width="100px;" alt="Michael Wasser"/><br /><sub><b>Michael Wasser</b></sub>](http://www.mikewasser.com)<br />[📖](https://github.com/cornerstonejs/cornerstoneTools/commits?author=untoldone "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/11068601?v=4" width="100px;" alt="Amandeep Singh"/><br /><sub><b>Amandeep Singh</b></sub>](https://github.com/singhArmani)<br />[🖋](#content-singhArmani "Content") | [<img src="https://avatars0.githubusercontent.com/u/1474137?v=4" width="100px;" alt="Madison Dickson"/><br /><sub><b>Madison Dickson</b></sub>](http://mix3dstudios.com)<br />[📖](https://github.com/cornerstonejs/cornerstoneTools/commits?author=mix3d "Documentation") |
| [<img src="https://avatars1.githubusercontent.com/u/3342530?v=4" width="100px;" alt="Kevin Lee Drum"/><br /><sub><b>Kevin Lee Drum</b></sub>](https://github.com/kevinleedrum)<br />[💻](https://github.com/cornerstonejs/cornerstoneTools/commits?author=kevinleedrum "Code") | [<img src="https://avatars3.githubusercontent.com/u/11224291?v=4" width="100px;" alt="Makarand Bauskar"/><br /><sub><b>Makarand Bauskar</b></sub>](https://github.com/mmbauskar)<br />[💻](https://github.com/cornerstonejs/cornerstoneTools/commits?author=mbauskar "Code") | [<img src="https://avatars0.githubusercontent.com/u/1713255?v=4" width="100px;" alt="Biharck Araujo"/><br /><sub><b>Biharck Araujo</b></sub>](http://www.biharck.com.br)<br />[💡](#example-biharck "Examples") [📖](https://github.com/cornerstonejs/cornerstoneTools/commits?author=biharck "Documentation") | [<img src="https://avatars3.githubusercontent.com/u/5349517?v=4" width="100px;" alt="Devon Bernard"/><br /><sub><b>Devon Bernard</b></sub>](https://www.linkedin.com/in/devonbernard)<br />[📖](https://github.com/cornerstonejs/cornerstoneTools/commits?author=DevonBernard "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/38315992?v=4" width="100px;" alt="Karl-Heinrich"/><br /><sub><b>Karl-Heinrich</b></sub>](https://github.com/Karl-Heinrich)<br />[🐛](https://github.com/cornerstonejs/cornerstoneTools/issues?q=author%3AKarl-Heinrich "Bug reports") [💻](https://github.com/cornerstonejs/cornerstoneTools/commits?author=Karl-Heinrich "Code") [⚠️](https://github.com/cornerstonejs/cornerstoneTools/commits?author=Karl-Heinrich "Tests") | [<img src="https://avatars0.githubusercontent.com/u/15172026?v=4" width="100px;" alt="counterxing"/><br /><sub><b>counterxing</b></sub>](https://blog.xingbofeng.com/)<br />[🐛](https://github.com/cornerstonejs/cornerstoneTools/issues?q=author%3Axingbofeng "Bug reports") [💻](https://github.com/cornerstonejs/cornerstoneTools/commits?author=xingbofeng "Code") | [<img src="https://avatars0.githubusercontent.com/u/50026015?v=4" width="100px;" alt="Jorge Lopes"/><br /><sub><b>Jorge Lopes</b></sub>](https://github.com/jlopes90)<br />[💬](#question-jlopes90 "Answering Questions") |
| [<img src="https://avatars2.githubusercontent.com/u/5546851?v=4" width="100px;" alt="Gabriel Garrido"/><br /><sub><b>Gabriel Garrido</b></sub>](http://garrido.io)<br />[💻](https://github.com/cornerstonejs/cornerstoneTools/commits?author=Ggpsv "Code") | [<img src="https://avatars0.githubusercontent.com/u/4126256?v=4" width="100px;" alt="ASVBPREAUBV"/><br /><sub><b>ASVBPREAUBV</b></sub>](https://github.com/ASVBPREAUBV)<br />[📖](https://github.com/cornerstonejs/cornerstoneTools/commits?author=ASVBPREAUBV "Documentation") | [<img src="https://avatars0.githubusercontent.com/u/50960211?v=4" width="100px;" alt="frolic06"/><br /><sub><b>frolic06</b></sub>](https://github.com/frolic06)<br />[💻](https://github.com/cornerstonejs/cornerstoneTools/commits?author=frolic06 "Code") | [<img src="https://avatars2.githubusercontent.com/u/26968918?v=4" width="100px;" alt="codepage949"/><br /><sub><b>codepage949</b></sub>](https://github.com/codepage949)<br />[💻](https://github.com/cornerstonejs/cornerstoneTools/commits?author=codepage949 "Code") | [<img src="https://avatars.githubusercontent.com/u/1915?v=4" width="100px;" alt="Asherah Connor"/><br /><sub><b>Asherah Connor</b></sub>](https://kivikakk.ee)<br />[💻](https://github.com/cornerstonejs/cornerstoneTools/commits?author=kivikakk "Code") | [<img src="https://avatars.githubusercontent.com/u/22633385?v=4" width="100px;" alt="Ikko Ashimine"/><br /><sub><b>Ikko Ashimine</b></sub>](https://bandism.net/)<br />[🐛](https://github.com/cornerstonejs/cornerstoneTools/issues?q=author%3Aeltociear "Bug reports") | [<img src="https://avatars.githubusercontent.com/u/27778909?v=4" width="100px;" alt="Bill Wallace"/><br /><sub><b>Bill Wallace</b></sub>](https://github.com/wayfarer3130)<br />[💻](https://github.com/cornerstonejs/cornerstoneTools/commits?author=wayfarer3130 "Code") [📖](https://github.com/cornerstonejs/cornerstoneTools/commits?author=wayfarer3130 "Documentation") |
| [<img src="https://avatars.githubusercontent.com/u/3341923?v=4" width="100px;" alt="Bruno Alves de Faria"/><br /><sub><b>Bruno Alves de Faria</b></sub>](http://radicalimaging.com/)<br />[🐛](https://github.com/cornerstonejs/cornerstoneTools/issues?q=author%3Abrunoalvesdefaria "Bug reports") [💻](https://github.com/cornerstonejs/cornerstoneTools/commits?author=brunoalvesdefaria "Code") [🖋](#content-brunoalvesdefaria "Content") [📖](https://github.com/cornerstonejs/cornerstoneTools/commits?author=brunoalvesdefaria "Documentation") [🔌](#plugin-brunoalvesdefaria "Plugin/utility libraries") [👀](#review-brunoalvesdefaria "Reviewed Pull Requests") [⚠️](https://github.com/cornerstonejs/cornerstoneTools/commits?author=brunoalvesdefaria "Tests") [🔧](#tool-brunoalvesdefaria "Tools") [📓](#userTesting-brunoalvesdefaria "User Testing") | [<img src="https://avatars.githubusercontent.com/u/13886933?v=4" width="100px;" alt="Igor Octaviano"/><br /><sub><b>Igor Octaviano</b></sub>](http://igoroctaviano.com)<br />[💻](https://github.com/cornerstonejs/cornerstoneTools/commits?author=igoroctaviano "Code") [📖](https://github.com/cornerstonejs/cornerstoneTools/commits?author=igoroctaviano "Documentation") [🚧](#maintenance-igoroctaviano "Maintenance") [👀](#review-igoroctaviano "Reviewed Pull Requests") [📓](#userTesting-igoroctaviano "User Testing") |
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

- [**See Feature Requests**][requests-feature]
- [**See Internal Change Requests**][requests-implementation]

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
[build-badge]: https://circleci.com/gh/cornerstonejs/cornerstoneTools/tree/master.svg?style=svg
[build]: https://circleci.com/gh/cornerstonejs/cornerstoneTools/tree/master
[contributing]: https://github.com/cornerstonejs/cornerstoneTools/blob/master/CONTRIBUTING.md
[coverage-badge]: https://codecov.io/gh/cornerstonejs/cornerstoneTools/branch/master/graphs/badge.svg
[coverage]: https://codecov.io/gh/cornerstonejs/cornerstoneTools/branch/master
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
[bugs]: https://github.com/cornerstonejs/cornerstoneTools/issues?q=is%3Aissue+is%3Aopen+label%3A"🐛+Bug%3A+Verified"+sort%3Acreated-desc
[requests-feature]: https://github.com/cornerstonejs/cornerstoneTools/issues?q=is%3Aissue+sort%3Areactions-%2B1-desc+label%3A"💻+Change%3A+Feature"+is%3Aopen
[requests-implementation]: https://github.com/cornerstonejs/cornerstoneTools/issues?q=is%3Aissue+sort%3Areactions-%2B1-desc+label%3A"💻+Change%3A+Implementation"+is%3Aopen
[good-first-issue]: https://github.com/cornerstonejs/cornerstoneTools/issues?utf8=✓&q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc+label%3A"🥇+Good+First+Issue"
[google-group]: https://groups.google.com/forum/#!forum/cornerstone-platform
<!-- prettier-ignore-end -->
