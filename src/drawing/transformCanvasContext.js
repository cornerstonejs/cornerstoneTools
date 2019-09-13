/**
 * Transform the canvas {@link CanvasRenderingContext2D|context} such that it
 * coincides with the orientation of the viewport.
 *
 * @public
 * @function transformCanvasContext
 * @memberof Drawing
 *
 * @param {CanvasRenderingContext2D} context - Context you wish to transform.
 * @param {HTMLCanvasElement} canvas - Canvas the context relates to.
 * @param {*} viewport - The viewport you wish to map on to.
 * @returns {void}
 */
export default function(context, canvas, viewport) {
  if (!(viewport.hflip || viewport.vflip || viewport.rotation)) {
    return;
  }

  const translation = {
    x: canvas.width / 2 + viewport.translation.x * viewport.scale,
    y: canvas.height / 2 + viewport.translation.y * viewport.scale,
  };

  context.translate(translation.x, translation.y);

  if (viewport.rotation) {
    context.rotate((viewport.rotation * Math.PI) / 180);
  }

  if (viewport.vflip) {
    context.scale(1, -1);
  }

  if (viewport.hflip) {
    context.scale(-1, 1);
  }

  context.translate(-translation.x, -translation.y);
}
