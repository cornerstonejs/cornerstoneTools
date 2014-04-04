cornerstoneTools
================

cornerstoneTools is a library built on top of [cornerstone](https://github.com/chafey/cornerstone) that provides
a set of common tools needed in medical imaging to work with images and stacks of images.

Status
------

**Project Status: Alpha**

NOTE: Project is currently under active development - functionality is not complete, bugs exist,
APIs will change and documentation is missing or not correct.

View the [live examples](https://rawgithub.com/chafey/cornerstoneTools/master/example/index.html) to see the
library in action!

Install
-------

Get a packaged source file:

* [cornerstoneTools.js](https://raw.githubusercontent.com/chafey/cornerstoneTools/master/dist/cornerstoneTools.js)
* [cornerstoneTools.min.js](https://raw.githubusercontent.com/chafey/cornerstoneTools/master/dist/cornerstoneTools.min.js)

Or install via [Bower](http://bower.io/):

> bower install cornerstoneTools

Usage
-------

```
TODO
```

Key Features
------------

* Tools that work with a single image
  * WW/WL
  * Zoom
  * Pan
  * Length
  * Rectangle ROI
  * Elliptical ROI
  * Pixel Probe
* Tools that work with a stack of images
  * Scroll
* Support for binding each tool to different mouse inputs:
  * Left mouse button
  * MIddle mouse button
  * Right mouse button
  * Mouse Wheel
* Support for touch based gestures
  * Drag
  * Pinch
* Tool framework that can be used to simplify development of new tools that work in a consistent manner with the included
  tools
* Math class that provide functionality often needed during tool development (e.g. computational geometry)

Architecture
------------

This library has the following external dependencies:

* jQuery
* cornerstone

This library organizes code into the following directories:

* imageTools - code for tools that work in the context of a single image
* stackTools - code for tools that work in the context of a stack of images (e.g. CT series)
* math - code for mathematical calculations that tools often need (e.g. computational geometry)
* manipulators - code for common tool interaction mechanisms - hit testing, handles, etc

Build System
============

This project uses grunt to build the software.

Pre-requisites:
---------------

NodeJs - [click to visit web site for installation instructions](http://nodejs.org).

grunt-cli

> npm install -g grunt-cli

Common Tasks
------------

Update dependencies (after each pull):
> npm install

> bower install

Running the build:
> grunt

Automatically running the build and unit tests after each source change:
> grunt watch

Backlog
------------
