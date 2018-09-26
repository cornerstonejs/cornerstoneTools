# Tool Types

{% include "./../partials/beta-warning.md" %}

In order to make development of new tools quick, easy and relatively boilerplate free, all tools `extend` one of three base classes, which provide the functionality required to integrate seamlessly into the `cornerstoneTools` framework.

Base classes have two types of methods of interest to tool developers:
- `@abstract` methods - These methods must be implemented by subclasses.
- `@virtual` methods - These methods have default functionality, but may be overridden by subclasses to alter functionality.

Check the `api` docs for full documentation of the api.

{% include "./base-tool.md" %}
{% include "./base-annotation-tool.md" %}
{% include "./base-brush-tool.md" %}
