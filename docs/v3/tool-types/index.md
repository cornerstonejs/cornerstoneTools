# Tool Types

In order to make development of new Tools quick, easy and relatively boilerplate-free, all Tools `extend` one of three base classes, which provide the functionality required to integrate seamlessly into the Cornerstone Tools framework.

Base classes have two types of methods of interest to Tool developers:

- `@abstract` methods: These methods must be implemented by subclasses.
- `@virtual` methods: These methods have default functionality, but may be overridden by subclasses to alter functionality.

Check the [`api` docs](https://tools.cornerstonejs.org/api/) for full documentation of the api.

{% include "./base-tool.md" %}

{% include "./base-annotation-tool.md" %}

{% include "./base-brush-tool.md" %}

{% include "./base-segmentation-tool.md" %}
