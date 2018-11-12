/**
 * Namespace for native DOM/Document types
 * @namespace CornerstoneTools.Drawing
 */

import external from '../externalModules.js';
import toolStyle from '../stateManagement/toolStyle.js';
import textStyle from '../stateManagement/textStyle.js';

/**
 * A {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle|color, gradient or pattern} to use inside shapes.
 * @typedef {(String|CanvasGradient|CanvasPattern)} FillStyle
 */

/**
 * A {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeStyle|color, gradient or pattern} to use for the lines around shapes.
 * @typedef {(String|CanvasGradient|CanvasPattern)} StrokeStyle
 */

/**
 * @callback ContextFn
 * @param {CanvasRenderingContext2D} context
 */
