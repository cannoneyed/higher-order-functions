export default `
  precision highp float;
  precision highp int;
  attribute vec3 color;
  attribute float pSize;
  attribute float pOpacity;
  uniform float size;
  uniform float scale;
  varying vec3 vColor;
  varying float vOpacity;
  void main() {
    vColor = color;
    vOpacity = pOpacity;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_PointSize = 2.0 * pSize * size * ( scale / length( mvPosition.xyz ) );
    gl_Position = projectionMatrix * mvPosition;
  }
`
