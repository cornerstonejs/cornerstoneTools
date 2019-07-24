# Cornerstone Tools Examples

👋 Looking for an Example's Source Code? Checkout:

- [`/gh-pages/examples`](https://github.com/cornerstonejs/cornerstoneTools/tree/gh-pages/examples)
- For example: [Length Tool Demo](https://tools.cornerstonejs.org/examples/tools/length.html) | [Length Tool Source](https://github.com/cornerstonejs/cornerstoneTools/blob/gh-pages/examples/tools/length.html)

👇 Want to create or modify an example? Keep reading 👇

## Getting Started

This directory contains the source code that powers [our examples](https://tools.cornerstonejs.org/examples/). We use [Jekyll](https://jekyllrb.com/), a static site generator, to turn these files into plain HTML/CSS/JS.

### Why Jekyll?

- Similar tools can share templates
- We can leverage "data" to generate content: (collections, data files, etc.)
- Markdown to HTML support
- Syntax highlighting for code examples

### Making Changes

_Requirements_

[Jekyll](https://jekyllrb.com/) is a [Ruby Gem](https://jekyllrb.com/docs/ruby-101/#gems). To get started using Ruby and Jekyll follow the [appropriate guide for your operating system](https://jekyllrb.com/docs/installation/).

_Commands_

Navigate to this directory in your shell / command prompt, and run any of the  following commands:

```shell
# Install missing gems/packages
bundle install

# Builds and serves site locally; watches for source changes
bundle exec jekyll serve
```

### Authoring Guidelines

If you're feeling a bit lost, I recommend brushing up on [Jekyll Basics](https://jekyllrb.com/docs/structure/). I'll try to include a brief overview here as it pertains to this project, but there's no better guide than Jekyll's own docs.

#### _Project Structure_

The source for examples lives in the `master` branch's `examples/` directory. When changes are committed, our [CI Server](https://circleci.com/gh/cornerstonejs/workflows/cornerstoneTools/tree/master) builds a new version of the [examples site](https://tools.cornerstonejs.org/examples/) and pushes the changes to the `gh-pages` branches `examples` directory. All files in the `gh-pages` branch are served using [GitHub Pages](https://pages.github.com/).

```
.
├── master/examples
│   ├── _includes/
│   ├── _layouts/
│   ├── assets/
│   ├── tools/
│   └── index.md
|
└── gh-pages/examples
    ├── assets/
    ├── tools/
    └── index.html
```

If a directory is prefixed with an underscore ( `_` ), it is a special directory. Non-prefixed directories are generated in place using [Front-Matter](https://jekyllrb.com/docs/front-matter/) and [Liquid](https://jekyllrb.com/docs/liquid/) templating.

#### _Templating_

Tool examples contain a small block of information at the top of their file that looks like this:

```md
---
layout: tool-simple
title: Angle Tool
toolName: Angle
toolType: annotation
---

# Tool specific content goes here.

Hello World :wave:
```

The `layout` field tells us which [layout](https://github.com/cornerstonejs/cornerstoneTools/tree/master/examples/_layouts) to use as a template. The other values become page variables that can be used by the template. For example, the `tool-simple` layout uses the `title` variable like so:

`<h1 class="title is-1">{{ page.title }}</h1>`

All content beneath the `---` is rendered in the `{{ content }}` of the target layout.

#### _Code Syntax Highlighting_

Wrapping a block of code using `highlight` blocks causes Jekyll to render it as an example with Syntax highlighting:

```javascript
{% highlight javascript %}
// Init cornerstone tools
cornerstoneTools.init();

// Add our tool, and set it's mode
const LengthTool = cornerstoneTools.LengthTool;

cornerstoneTools.addTool(LengthTool)
cornerstoneTools.setToolActive('Length', {
  mouseButtonMask: 1
});
{% endhighlight %}
```

Produces something similar to:

![Example Syntax Highlighting Output](https://raw.githubusercontent.com/cornerstonejs/cornerstoneTools/master/examples/readme-screenshot.png)

## Misc.

_Targeting a different version of a `cornerstone` dependency:_

The example's dependencies are specified in [`/examples/includes/head.html`](https://github.com/cornerstonejs/cornerstoneTools/blob/master/examples/_includes/head.html#L30-L40). You can update the imports here to a local/dev version of `cornerstone-tools`, or update the unpkg tag to look at a previously released version.

_How do I make things prettier?_

We currently include [bulma](https://bulma.io/documentation/), a CSS framework, to add a few classes to make styling easier. Please reference their documentation if you would like to leverage styling.

## Developing the examples with Jerkyll without installing Ruby/Gems

Serve the page with autoreload in docker:
```
docker run --rm -it --volume="$PWD:/srv/jekyll" -p 4000:4000 jekyll/jekyll:3.8.5 jekyll serve --watch
```
Go to localhost:4000

Explanation:
```
docker run
--rm                          # Automatically remove the container when it exits
-it                           # Makes the logs from inside the container visible in your comandline
--volume="$PWD:/srv/jekyll"   # Takes the current folder and maps it to the container
-p 4000:4000                  # Fowards the port 4000 to localhost:4000
jekyll/jekyll:3.8.5           # Which docker image to use
jekyll serve --watch          # Command to run inside the container
```
