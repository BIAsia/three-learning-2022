varying vec3 vPosition;
varying vec2 vUV;
varying vec3 vNormal;

void main() {
  vPosition = position;
  vUV = uv;
  vNormal = normal;
  vNormal = normalize(normal*normalMatrix);


  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = 50. / -mvPosition.z;
}