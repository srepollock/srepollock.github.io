export const fogChunk = /* glsl */ `
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  vec3 applyFog(vec3 color, float dist) {
    float f = 1.0 - exp(-pow(uFogDensity * dist, 2.0));
    return mix(color, uFogColor, clamp(f, 0.0, 1.0));
  }
`;

export const hashChunk = /* glsl */ `
  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
`;

export const skyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const skyFragment = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uMid;
  uniform vec3 uHorizon;
  uniform vec3 uSun;
  uniform vec3 uSunDir;
  varying vec3 vDir;
  void main() {
    float h = clamp(vDir.y, -0.2, 1.0);
    vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.18, h));
    col = mix(col, uTop, smoothstep(0.16, 0.65, h));
    float sun = pow(max(dot(normalize(vDir), normalize(uSunDir)), 0.0), 18.0);
    col += uSun * sun * 0.55;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export const buildingVertex = /* glsl */ `
  attribute float aSeed;
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying float vSeed;
  varying float vHeight;
  varying float vDist;
  void main() {
    vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vNormal = normal;
    vSeed = aSeed;
    vHeight = instanceMatrix[1][1];
    vec4 mv = viewMatrix * world;
    vDist = length(mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

export const buildingFragment = /* glsl */ `
  uniform vec3 uFacade;
  uniform vec3 uFacadeTop;
  uniform vec3 uWindow;
  uniform float uLit;
  uniform float uAmbient;
  uniform float uTime;
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying float vSeed;
  varying float vHeight;
  varying float vDist;
  ${fogChunk}
  ${hashChunk}
  void main() {
    vec3 n = normalize(vNormal);
    float side = 1.0 - step(0.5, abs(n.y));
    float rel = clamp(vWorld.y / max(vHeight, 1.0), 0.0, 1.0);
    vec3 base = mix(uFacade, uFacadeTop, rel * 0.8);
    float shade = 0.55 + 0.45 * max(dot(n, normalize(vec3(-0.5, 0.7, 0.4))), 0.0);
    vec3 col = base * mix(1.0, shade, 0.6) * (0.65 + uAmbient * 0.5);

    float u = abs(n.x) > 0.5 ? vWorld.z : vWorld.x;
    vec2 cellSize = vec2(1.7, 2.4);
    vec2 cell = floor(vec2(u, vWorld.y) / cellSize);
    vec2 f = fract(vec2(u, vWorld.y) / cellSize);
    float win = step(0.22, f.x) * step(f.x, 0.78) * step(0.28, f.y) * step(f.y, 0.78);
    win *= side * step(1.4, vWorld.y) * step(vWorld.y, vHeight - 0.8);

    float r = hash12(cell + vSeed * 97.0 + n.xz * 13.0);
    float flicker = step(0.997, hash12(cell + floor(uTime * 0.2) + vSeed));
    float lit = step(0.58, r) * (1.0 - flicker);
    vec3 warm = uWindow * (0.6 + 0.6 * hash12(cell * 1.7 + vSeed));
    vec3 cool = vec3(0.75, 0.88, 1.0) * 0.8;
    vec3 lamp = mix(warm, cool, step(0.93, r));
    vec3 night = mix(col * 1.4, lamp, lit);
    vec3 day = mix(col, uWindow * 0.3 + col * 0.6, 0.18 + 0.18 * r);
    col = mix(col, mix(day, night, uLit), win);

    float roofLine = side * smoothstep(vHeight - 0.35, vHeight - 0.05, vWorld.y);
    col += roofLine * 0.05;

    gl_FragColor = vec4(applyFog(col, vDist), 1.0);
  }
`;

export const groundVertex = /* glsl */ `
  varying vec3 vWorld;
  varying float vDist;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vec4 mv = viewMatrix * world;
    vDist = length(mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

export const groundFragment = /* glsl */ `
  uniform vec3 uGround;
  uniform vec3 uStreet;
  uniform float uBlock;
  uniform float uStreetWidth;
  uniform vec2 uOrigin;
  uniform float uLit;
  varying vec3 vWorld;
  varying float vDist;
  ${fogChunk}
  void main() {
    vec2 g = mod(vWorld.xz - uOrigin + uStreetWidth * 0.5, uBlock);
    float street = 1.0 - step(uStreetWidth, min(g.x, g.y));
    float centre = street * (1.0 - smoothstep(0.0, 0.18, abs(min(g.x, g.y) - uStreetWidth * 0.5)));
    vec3 col = uGround;
    col = mix(col, uGround * 1.6 + uStreet * 0.05, street);
    col += uStreet * centre * mix(0.12, 0.35, uLit);
    gl_FragColor = vec4(applyFog(col, vDist), 1.0);
  }
`;

export const waterFragment = /* glsl */ `
  uniform vec3 uWater;
  uniform vec3 uGlint;
  uniform float uTime;
  uniform float uLit;
  varying vec3 vWorld;
  varying float vDist;
  ${fogChunk}
  ${hashChunk}
  void main() {
    float waves = sin(vWorld.x * 0.35 + uTime * 0.8) * sin(vWorld.z * 0.9 - uTime * 0.6);
    float streak = smoothstep(0.82, 1.0, waves) * step(0.55, hash12(floor(vWorld.xz * vec2(0.2, 1.2))));
    float shoreGlow = exp(-abs(vWorld.z + 72.0) * 0.05);
    vec3 col = uWater + uGlint * streak * mix(0.08, 0.35, uLit) * (0.3 + shoreGlow);
    gl_FragColor = vec4(applyFog(col, vDist), 1.0);
  }
`;


