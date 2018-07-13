# cornerstone-tools@next

[![CircleCI](https://circleci.com/gh/cornerstonejs/cornerstoneTools/tree/vNext.svg?style=svg)](https://circleci.com/gh/cornerstonejs/cornerstoneTools/tree/vNext) [![Coverage Status](https://coveralls.io/repos/github/cornerstonejs/cornerstoneTools/badge.svg?branch=vNext)](https://coveralls.io/github/cornerstonejs/cornerstoneTools?branch=vNext)

The `cornerstone-tools` vNext branch is a preview branch for upcoming major API changes. When new changes are merged, if all tests are passing, a new version is cut and published to NPM under the `next` tag. When enough progress has been made, a more formal deprecation and adoption strategy will be announced as this API replaces v2.

You can track [this version's progress here](https://github.com/cornerstonejs/cornerstoneTools/projects/1). Any/all help in determining our API target, completing issues, finding bugs, etc. is appreciated.

## Getting Started

### Install

**Via NPM:** (preferred)

_Latest stable release:_

- `npm install --save cornerstone-tools`

_Pre-release, unstable, mostly for contributors:_

- `npm install --save cornerstone-tools@next`

### Usage

See the [live examples](https://rawgithub.com/cornerstonejs/cornerstoneTools/master/examples/index.html) and [wiki](https://github.com/cornerstonejs/cornerstoneTools/wiki) for documentation (Soon to be replaced by [tools.cornerstonejs.org](http://tools.cornerstonejs.org/)) on how to use this library

**A common setup when using modules:**

```javascript
// Load NPM packages
import Hammer from "hammerjs"; // npm install --save hammerjs
import * as cornerstone from "cornerstone-core"; // npm install --save cornerstone-core
import * as cornerstoneTools from "cornerstone-tools";

// Specify external dependencies
cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.Hammer = Hammer;
```

## Contributing

**How To Contribute:**

1.  Fork this repository
2.  Clone the forked repository
3.  Before committing code, create a branch-per-feature, or branch-per-bug
4.  Create pull requests against `cornerstonejs/cornerstoneTools/master`

## Build System

This project uses webpack to build the software.

**Requirements:**

- [NodeJs](http://nodejs.org).

**Common Tasks:**

Update dependencies (after each pull):

> npm install

Running the build:

> npm start

Automatically running the build and unit tests after each source change:

> npm run watch

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE
[npm-url]: https://npmjs.org/package/cornerstone-tools
[npm-version-image]: http://img.shields.io/npm/v/cornerstone-tools.svg?style=flat
[npm-downloads-image]: http://img.shields.io/npm/dm/cornerstone-tools.svg?style=flat
[travis-url]: http://travis-ci.org/cornerstonejs/cornerstoneTools
[travis-image]: https://travis-ci.org/cornerstonejs/cornerstoneTools.svg?branch=master
[coverage-url]: https://coveralls.io/github/cornerstonejs/cornerstoneTools?branch=master
[coverage-image]: https://coveralls.io/repos/github/cornerstonejs/cornerstoneTools/badge.svg?branch=master
