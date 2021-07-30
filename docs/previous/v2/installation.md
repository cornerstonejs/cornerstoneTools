# Installation

### Direct Download / CDN

[https://unpkg.com/cornerstone-tools](https://unpkg.com/cornerstone-tools)

<!--email_off-->

[Unpkg.com](https://unpkg.com) provides NPM-based CDN links. The above link will always point to the latest release on NPM. You can also use a specific version/tag via URLs like `https://unpkg.com/cornerstone-tools@2.0.0`.

<!--/email_off-->

Include `cornerstoneTools` after Cornerstone and it will install itself automatically:

```html
<script src="/path/to/cornerstone.js"></script>
<script src="/path/to/cornerstoneMath.js"></script>
<script src="/path/to/cornerstoneTools.js"></script>
```

### NPM

```bash
npm install cornerstone-tools --save
```

When used with a module system, you can import `cornerstoneTools` like this:

```js
// External Dependencies
import Hammer from "hammerjs";

// Cornerstone Libraries
import * as cornerstone from "cornerstone-core";
import * as cornerstoneMath from "cornerstone-math";
import * as cornerstoneTools from "cornerstone-tools";

// Specify external dependencies
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
```

You don't need to do this when using global script tags.

### Dev Build

You will have to clone directly from GitHub and build `cornerstoneTools` yourself if you want to use the latest dev build.

```bash
git clone https://github.com/cornerstonejs/cornerstoneTools.git node_modules/cornerstoneTools
cd node_modules/cornerstoneTools
npm install
npm run build
```
