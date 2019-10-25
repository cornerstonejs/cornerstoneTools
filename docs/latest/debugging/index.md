# Debugging

Cornerstone Tools is using the [`debug`](https://github.com/visionmedia/debug/) library for logging debug information.

By default, in the minified "production" build of cornerstone tools, only
errors will be logged to the console.

When using the un-minified or "development" build, you may also see some
warnings logged to the console in some scenarios.

But there is more log information available if you need it.

## Turning debug logs on and off

`cornerstoneTools` exports `enableLogger` and `disableLogger` methods as top level api methods.

`enableLogger` takes a scoping string with which you can specify scopes to be included / excluded.

Multiple scopes are comma separated. Excluding a scope is done by prefixing with `-`. You can use the `*` match against many scopes.

```js
import cornerstoneTools from 'cornerstone-tools';

// Enable logging
cornerstoneTools.enableLogger();
// defaults to "cornerstoneTools:*" which will print all logs from the cornerstoneTools package

// This is just some sugar ontop of the debug library. You can enable all
// debug logging – including things outside of cornerstoneTools
cornerstoneTools.enableLogger('*');

// Only show logs from setToolMode.js
cornerstoneTools.enableLogger('cornerstoneTools:store:setToolMode');

// Show all logs, but exclude the eventDispatchers (which can be a bit noisy)
cornerstoneTools.enableLogger(
  'cornerstoneTools:*,-cornerstoneTools:eventDispatchers:*'
);

// Disable logging
const prevSettings = cornerstoneTools.disableLogger();
// `disableLogger` returns a string of the previous settings in case
// you wanted to toggle logging off and back on later.

// Eg. this would re-enable the previous settings
cornerstoneTools.enableLogging(prevSettings);
```

As this is based on the wonderful `debug` library, you can also enable/disable
the logger when you don't have access to `cornerstoneTools` by using `localStorage`.

```js
// This will enable all cornerstoneTools logs
localStorage.setItem('debug', 'cornerstoneTools:*');
// You will need to refresh the browser for this setting to take effect
```
