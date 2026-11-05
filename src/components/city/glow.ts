import * as THREE from "three";

const glowVertex = /* glsl */ `
  attribute vec3 color;
  uniform float uSize;
  uniform float uScale;
  varying vec3 vColor;
  varying float vFade;
  uniform float uFogDensity;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float dist = -mv.z;
    vColor = color;
    vFade = exp(-pow(uFogDensity * dist, 2.0));
    gl_PointSize = clamp(uSize * uScale / max(dist, 1.0), 1.5, 14.0);
    gl_Position = projectionMatrix * mv;
  }
`;

const glowFragment = /* glsl */ `
  uniform float uIntensity;
  varying vec3 vColor;
  varying float vFade;
  void main() {
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    float r = dot(p, p);
    if (r > 1.0) discard;
    float core = exp(-r * 6.0);
    float halo = exp(-r * 1.6) * 0.35;
    gl_FragColor = vec4(vColor * (core + halo) * uIntensity * vFade, 1.0);
    #include <colorspace_fragment>
  }
`;

export type GlowMaterial = THREE.ShaderMaterial & {
  uniforms: { uSize: THREE.IUniform<number>; uScale: THREE.IUniform<number>; uIntensity: THREE.IUniform<number>; uFogDensity: THREE.IUniform<number> };
};

export function createGlowMaterial(size: number): GlowMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: glowVertex,
    fragmentShader: glowFragment,
    uniforms: {
      uSize: { value: size },
      uScale: { value: 800 },
      uIntensity: { value: 1 },
      uFogDensity: { value: 0.005 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  }) as GlowMaterial;
}

export function createGlowPoints(count: number, size: number): { points: THREE.Points; positions: Float32Array; colors: Float32Array; material: GlowMaterial } {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage));
  const material = createGlowMaterial(size);
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  return { points, positions, colors, material };
}
