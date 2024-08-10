function calculatePolygonCentroid(polygon) {
  let centroidX = 0;
  let centroidY = 0;
  let signedArea = 0;
  let x0 = 0;
  let y0 = 0;
  let x1 = 0;
  let y1 = 0;
  let a = 0;

  for (let i = 0; i < polygon.length - 1; i++) {
    x0 = polygon[i][0];
    y0 = polygon[i][1];
    x1 = polygon[i + 1][0];
    y1 = polygon[i + 1][1];
    a = x0 * y1 - x1 * y0;
    signedArea += a;
    centroidX += (x0 + x1) * a;
    centroidY += (y0 + y1) * a;
  }

  x0 = polygon[polygon.length - 1][0];
  y0 = polygon[polygon.length - 1][1];
  x1 = polygon[0][0];
  y1 = polygon[0][1];
  a = x0 * y1 - x1 * y0;
  signedArea += a;
  centroidX += (x0 + x1) * a;
  centroidY += (y0 + y1) * a;

  signedArea *= 0.5;

  centroidX /= 6 * signedArea;
  centroidY /= 6 * signedArea;

  return [centroidX, centroidY];
}
