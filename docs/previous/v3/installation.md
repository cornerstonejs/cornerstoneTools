# Installation

### Compatibility Note

CornerstoneTools.js does not support IE8 and below because it uses ECMAScript 5 features that are un-shimmable in IE8. However it supports all [ECMAScript 5 compliant browsers](https://caniuse.com/#feat=es5).

### Release Notes

We're a small team, so our docs may not always be 100% accurate. Please feel free to create an issue and/or PR a change to update our docs.

- Latest stable version: `@latest` 2.3.9
- Latest beta version: `@next` 3.0.0-b.1003

You can find the latest versions for each tag by clicking the `versions` tab for [the cornerstone-tools npm listing](https://www.npmjs.com/package/cornerstone-tools)

Detailed release notes for each version are available on GitHub.

## Direct `<script>` Include

Simply download and include with a script tag. `CornerstoneTools` will be registered as a global variable.

### CDN

We recommend linking to a specific version number that you can update manually:

```html
<script src="https://cdn.jsdelivr.net/npm/cornerstone-tools@next"></script>
```

You can browse the source of the NPM package at [cdn.jsdelivr.net/npm/cornerstone-tools](https://cdn.jsdelivr.net/npm/cornerstone-tools@next).

CornerstoneTools.js is also available on [unpkg](https://unpkg.com/cornerstone-tools).

## NPM

NPM is the recommended installation method when building large scale applications. It pairs nicely with module bundlers such as [Webpack](https://webpack.js.org/) or [Browserify](http://browserify.org/).

```shell
# latest stable
npm install --save cornerstone-tools

# latest @next (pre-release)
npm install --save cornerstone-tools@next
```

## Explanation of Different Builds

In the `dist/` [directory of the NPM package](https://cdn.jsdelivr.net/npm/cornerstone-tools/dist/) you will find a few different builds for CornerstoneTools.js. Here's an overview of the difference between them:

| Type             | Bundle                        | Available       |
| ---------------- | ----------------------------- | --------------- |
| UMD              | `cornerstone-tools.js`        | Yes             |
| UMD (production) | `cornerstone-tools.min.js`    | Yes             |
| CommonJS         | `cornerstone-tools.common.js` | _(coming soon)_ |
| ES Module        | `cornerstone-tools.esm.js`    | _(coming soon)_ |

### Terms

- [UMD](https://github.com/umdjs/umd): UMD builds can be used directly in the browser via a `<script>` tag. The default file from jsDelivr CDN at https://cdn.jsdelivr.net/npm/cornerstone-tools is the UMD build (cornerstone-tools.js).

- [CommonJS](http://wiki.commonjs.org/wiki/Modules/1.1): CommonJS builds are intended for use with older bundlers like browserify or webpack 1. The default file for these bundlers (`pkg.main`) is the CommonJS build (`cornerstone-tools.common.js`).

- [ES Module](http://exploringjs.com/es6/ch_modules.html): ES module builds are intended for use with modern bundlers like webpack 2+ or rollup. The default file for these bundlers (`pkg.module`) is the ES Module build (`cornerstone-tools.esm.js`).

## Dev Build

1. Update dependencies (after each pull):

```bash
npm install
```

2. Running the build:

```bash
npm start
```

3. Run the local development server:

```bash
npm run start:dev
```
