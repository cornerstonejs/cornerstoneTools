## Binary Tools {#binary-tools}

In general, Tools can be in four [modes](../anatomy-of-a-tool/index.md#modes): `Active` , `Passive`, `Enabled` or `Disabled`. However, for some Tools only a subset of these are required/useful. For example, an overlay that can only be toggled on/off only makes sense to be `Enabled` or `Disabled` (e.g. `ScaleOverlayTool`). Using a binary mixin will re-direct the unused modes so that the caller of api doesn't have to worry about this.

### enabledOrDisabledBinaryTool

A Tool with the `enabledOrDisabledBinaryTool` mixin can only be `Enabled` or `Disabled` (e.g. `ScaleOverlayTool`).
If the Tool is set `Active`, the mode will be redirected to `Enabled`.
If the Tool is set `Passive`, the mode will be redirected to `Disabled`.

### activeOrDisabledBinaryTool

A Tool with the `activeOrDisabledBinaryTool` mixin can only be `Active` or `Disabled` (e.g. `FreehandSculpterMouseTool`).
If the Tool is set `Enabled`, the mode will be redirected to `Active`.
If the Tool is set `Passive`, the mode will be redirected to `Disabled`.
