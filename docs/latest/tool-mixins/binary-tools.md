## Binary Tools {#binary-tools}

In general, tools can be in four modes, `active` , `passive`, `enabled` or `disabled`. However, for some tools only a subset of these are required/useful. For example, an overlay that can only be toggled on/off only makes sense to be `enabled` or `disabled` (e.g. `ScaleOverlayTool`). Using a binary tools mixin will re-direct the unused modes so that the caller of api doesn't have to worry about this.

### enabledOrDisabledBinaryTool

A tool with the `enabledOrDisabledBinaryTool` mixin can only be `enabled` or `disabled` (e.g. `ScaleOverlayTool`).
If the tool is set `active`, the mode will be redirected to `enabled`.
If the tool is set `passive`, the mode will be redirected to `disabled`.

### activeOrDisabledBinaryTool

A tool with the `activeOrDisabledBinaryTool` mixin can only be `active` or `disabled` (e.g. `FreehandSculpterMouseTool`).
If the tool is set `enabled`, the mode will be redirected to `active`.
If the tool is set `passive`, the mode will be redirected to `disabled`.
