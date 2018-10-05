# Plugins

{% include "./../partials/beta-warning.md" %}

`cornerstoneTools` v3.0 comes with a new plugin architecture, so that one can easily drop new `tool`s, `mixin`s, `manipulator`s, `module`s and more into `cornerstoneTools`. You can add a single entity at a time, or package up a selection of related items in a single [plugin](./plugins.md) that can be imported.

The plugin architecture comes with the advantage of not having to maintain a fork of the entire codebase, should you wish to include some custom functionality. However, if you think something you have developed would be valued by the wider `cornerstone` community, please consider submitting a pull request and contributing it back.

{% include "./plugin-structure.md" %}
{% include "./modules.md" %}
{% include "./tools.md" %}
{% include "./mixins.md" %}
{% include "./registering-a-plugin.md" %}
{% include "./using-plugins.md" %}
{% include "./cross-plugin-dependencies.md" %}
