// http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas
export default function (context, x, y, w, h) {
  const kappa = 0.5522848,
    ox = (w / 2) * kappa, // Control point offset horizontal
    oy = (h / 2) * kappa, // Control point offset vertical
    xe = x + w, // X-end
    ye = y + h, // Y-end
    xm = x + w / 2, // X-middle
    ym = y + h / 2; // Y-middle

  context.beginPath();
  context.moveTo(x, ym);
  context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
  context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
  context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
  context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
  context.closePath();
  context.stroke();
}
