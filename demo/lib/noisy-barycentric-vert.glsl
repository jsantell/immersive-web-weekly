uniform float time;
uniform float noiseMod;
uniform float posDampen;
varying vec3 vPosition;
varying float vNoise;
varying vec2 vBC;
#pragma glslify: snoise3 = require(glsl-noise/classic/3d)
#pragma glslify: ease = require(glsl-easings/quadratic-out) 
attribute vec2 barycentric;

void main() {
  vBC = barycentric;
  float t = time + 20.0;
  vNoise = snoise3(noiseMod * t * vec3(position.x, position.y, 3.0 * position.z+100.0) * 0.5 + 0.5);

  float isEdge = step(0.01, uv.x) * step(0.01, uv.y) * step(0.01, 1.0 - uv.x) * step(0.01, 1.0 - uv.y);
  vPosition = position + (vec3(0, 100, 0) * vNoise * posDampen * isEdge);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
}
