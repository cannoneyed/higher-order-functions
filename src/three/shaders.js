export const fragmentShader = `
    varying vec3 vColor;
    void main() {
        gl_FragColor = vec4( vColor, 1.0 );
    }
`;

export const vertexShader = `
    attribute float vertexIndex;
    attribute vec3 center;
    uniform float size;
    uniform float depthCompensation;
    uniform vec3 color;
    varying vec3 vColor;
    void main() {
        vec3 pos = vec3(0.0, 0.0, 0.0);

        if (vertexIndex == 0.0) {
          pos.x = -0.5 * size * depthCompensation + center.x;
          pos.y = 0.5 * size * depthCompensation + center.y;
        }
        if (vertexIndex == 1.0) {
          pos.x = 0.5 * size * depthCompensation + center.x;
          pos.y = 0.5 * size * depthCompensation + center.y;
        }
        if (vertexIndex == 2.0) {
          pos.x = -0.5 * size * depthCompensation + center.x;
          pos.y = -0.5 * size * depthCompensation + center.y;
        }
        if (vertexIndex == 3.0) {
          pos.x = 0.5 * size * depthCompensation + center.x;
          pos.y = -0.5 * size * depthCompensation + center.y;
        }

        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
        gl_Position = projectionMatrix * mvPosition;
    }
`;
