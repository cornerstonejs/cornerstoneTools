# Migrating Major Versions

In [Semantic Versioning](https://semver.org/), a major version change (1.x.x to 2.x.x) occurs when we make incompatible API changes between releases. Simply put, sometimes we need to _break_ things to provide new major features or optimizations. If you find yourself upgrading to a new major version, you should expect additional work will need to be done to upgrade your codebase. This page contains documentation to help update code bases using an older version of Cornerstone:


## v2.x.x from v1.x.x

This major version drops jQuery as a dependency across all Cornerstone libraries. To accomplish this, how we changed promises internally needed to change; as well as how we emit and consume emitted events. The migration should be fairly painless, unless you've built a large number of custom tools that rely on jQuery.

### Update Packages

- Update `cornerstone-core` to v2.x.x
- Update `cornerstone-tools` to v2.x.x
- If you use `cornerstone-wado-image-loader`, update it to v2.x.x
- If you use `cornerstone-web-image-loader`, update it to v2.x.x

### Update Code

_You no longer need to provide a jQuery external dependency:_

`cornerstonePackageNameHere.external.$ = $`

_Framework level events have been changed:_

- From: `$(cornerstone.events).on('CornerstoneEventName', function(evt, data){ })`
- To: `cornerstone.event.addEventListener('cornerstoneeventname', function(evt){ })`

Where `evt.detail` now contains the data previously in the old handler's second param.

_To listen to events for a given enabled element, change:_

- From: `$.on('CornerstoneCamelCaseName', function (evt, data) { })`
- To: `element.addEventListener('cornerstonelowercasename', function (evt){ })`

Where `evt.detail` now contains the data previously in the old handler's second param.

You can see a full list of CornerstoneTool events here: [src/events.js](https://github.com/cornerstonejs/cornerstoneTools/blob/29182180ed3f850ba41c609b98b96464affca5f0/src/events.js)

## v1.x.x from v0.9.x

**TODO**
