export default `
  precision highp float;
  precision highp int;
  uniform vec3 psColor;
  uniform float opacity;
  varying vec3 vColor;
  varying float vOpacity;
  uniform sampler2D map;
  void main() {
    gl_FragColor = vec4( psColor, vOpacity );
    gl_FragColor = gl_FragColor * texture2D( map, vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y ) );
    gl_FragColor = gl_FragColor * vec4( vColor, 1.0 );
  }
`
