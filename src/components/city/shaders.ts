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
  uniform vec3 uBelow;
  varying vec3 vDir;
  void main() {
    float h = clamp(vDir.y, -0.2, 1.0);
    vec2 toSun = normalize(uSunDir.xz);
    float towardSun = pow(max(dot(normalize(vDir.xz + 1e-5), toSun) * 0.5 + 0.5, 0.0), 3.0);
    vec3 horizon = mix(mix(uMid, uBelow, 0.35), uHorizon, towardSun);
    vec3 col = mix(horizon, uMid, smoothstep(0.0, 0.18, h));
    col = mix(col, uTop, smoothstep(0.16, 0.65, h));
    float sun = pow(max(dot(normalize(vDir), normalize(uSunDir)), 0.0), 18.0);
    col += uSun * sun * 0.55;
    col = mix(col, uBelow, smoothstep(0.0, -0.06, vDir.y));
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

export const buildingVertex = /* glsl */ `
  attribute float aSeed;
  attribute float aStyle;
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vSeed;
  varying float vStyle;
  varying float vBase;
  varying float vTop;
  varying float vDist;
  void main() {
    vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vNormal = normal;
    vView = cameraPosition - world.xyz;
    vSeed = aSeed;
    vStyle = aStyle;
    vBase = instanceMatrix[3][1];
    vTop = instanceMatrix[3][1] + instanceMatrix[1][1];
    vec4 mv = viewMatrix * world;
    vDist = length(mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

export const buildingFragment = /* glsl */ `
  uniform vec3 uFacade;
  uniform vec3 uFacadeTop;
  uniform vec3 uWindow;
  uniform vec3 uSkyTop;
  uniform vec3 uSkyHorizon;
  uniform float uLit;
  uniform float uAmbient;
  uniform float uTime;
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vSeed;
  varying float vStyle;
  varying float vBase;
  varying float vTop;
  varying float vDist;
  ${fogChunk}
  ${hashChunk}
  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vView);
    float side = 1.0 - step(0.5, abs(n.y));
    int style = int(vStyle + 0.5);
    float tint = hash12(vec2(vSeed * 41.0, 3.0));

    vec3 base = mix(uFacade, uFacadeTop, clamp(vWorld.y / 120.0, 0.0, 1.0) * 0.7);
    if (style == 1) base *= 1.35 + tint * 0.25;
    else if (style == 3) base *= 1.15 + tint * 0.2;
    else if (style == 2) base *= 1.05;
    float shade = 0.6 + 0.4 * max(dot(n, normalize(vec3(-0.5, 0.75, 0.35))), 0.0);
    vec3 col = base * shade * (0.7 + uAmbient * 0.45);

    float u = abs(n.x) > 0.5 ? vWorld.z : vWorld.x;
    float y = vWorld.y - vBase;
    vec2 cellSize = style == 0 ? vec2(0.95, 1.25) : style == 2 ? vec2(0.8, 1.5) : style == 3 ? vec2(1.7, 1.35) : vec2(1.35, 1.6);
    vec2 cell = floor(vec2(u, y) / cellSize);
    vec2 f = fract(vec2(u, y) / cellSize);
    vec2 lo = style == 0 ? vec2(0.06, 0.12) : style == 2 ? vec2(0.34, 0.08) : style == 3 ? vec2(0.08, 0.32) : vec2(0.24, 0.3);
    vec2 hi = style == 0 ? vec2(0.94, 0.94) : style == 2 ? vec2(0.94, 0.94) : style == 3 ? vec2(0.92, 0.84) : vec2(0.76, 0.78);
    float win = step(lo.x, f.x) * step(f.x, hi.x) * step(lo.y, f.y) * step(f.y, hi.y);
    float groundFloor = step(y, 1.4) * step(vBase, 0.01);
    win *= side * step(vWorld.y, vTop - 0.6) * (1.0 - groundFloor);

    float floorRoll = hash12(vec2(cell.y, vSeed * 97.0));
    float roomRoll = hash12(vec2(floor(cell.x / 3.0), cell.y + vSeed * 53.0) + n.xz * 7.0);
    float litChance = style == 0 ? 0.26 : style == 3 ? 0.4 : 0.34;
    float lit = step(1.0 - litChance, roomRoll * 0.7 + floorRoll * 0.3);
    lit *= 1.0 - step(0.997, hash12(cell + floor(uTime * 0.15) + vSeed));
    float r = hash12(cell + vSeed * 13.0);
    vec3 warm = uWindow * (0.45 + 0.75 * r * r);
    vec3 cool = vec3(0.6, 0.74, 0.9) * (0.45 + 0.25 * r);
    vec3 lamp = mix(warm, cool, step(0.88, roomRoll));

    float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
    vec3 sky = mix(uSkyHorizon, uSkyTop, clamp(reflect(-v, n).y * 1.5, 0.0, 1.0));
    vec3 glass = mix(base * 0.6, sky, 0.1 + 0.5 * fres);
    vec3 dark = style == 0 ? glass : base * 0.42 + sky * 0.12 * fres;
    vec3 night = mix(dark * 0.9, lamp, lit);
    vec3 day = mix(dark, sky * 0.9, 0.2 + 0.5 * fres);
    col = mix(col, mix(day, night, uLit), win);

    if (style == 0) col = mix(col, glass * (0.85 + 0.3 * uAmbient), side * (1.0 - win) * 0.65);
    float band = style == 3 ? step(fract(y / cellSize.y), 0.12) * side : 0.0;
    col = mix(col, base * 1.6, band * 0.6);

    vec3 lobby = uWindow * 1.1;
    col = mix(col, mix(base, lobby, uLit), groundFloor * side * step(0.35, hash12(vec2(floor(u / 2.5), vSeed))) * 0.85);

    float roofEdge = side * smoothstep(vTop - 0.3, vTop - 0.05, vWorld.y);
    col += roofEdge * 0.06;
    col *= mix(0.62, 1.0, smoothstep(0.0, 14.0, vWorld.y));

    gl_FragColor = vec4(applyFog(col, vDist), 1.0);

    #include <colorspace_fragment>
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
  uniform vec2 uExtent;
  uniform float uLit;
  varying vec3 vWorld;
  varying float vDist;
  ${fogChunk}
  void main() {
    vec2 local = vWorld.xz - uOrigin;
    float hw = uStreetWidth * 0.5;
    float inside = step(-uStreetWidth, local.x) * step(local.x, uExtent.x + uStreetWidth)
      * step(-uStreetWidth, local.y) * step(local.y, uExtent.y + uStreetWidth);
    vec2 g = mod(local + hw, uBlock) - hw;
    vec2 d = abs(g);
    float onX = step(d.x, hw);
    float onZ = step(d.y, hw);
    float road = max(onX, onZ) * inside;
    float crossing = onX * onZ;
    float walkX = step(hw, d.x) * step(d.x, hw + 0.45);
    float walkZ = step(hw, d.y) * step(d.y, hw + 0.45);
    float sidewalk = max(walkX, walkZ) * (1.0 - road) * inside;

    float along = onX > 0.5 ? local.y : local.x;
    float centre = (1.0 - crossing) * road * (1.0 - step(0.06, onX > 0.5 ? d.x : d.y)) * step(0.5, fract(along / 1.6));
    float zebraX = onZ * (1.0 - onX) * step(d.x, hw + 0.9) * step(hw, d.x) * step(0.5, fract(local.y * 2.4));
    float zebraZ = onX * (1.0 - onZ) * step(d.y, hw + 0.9) * step(hw, d.y) * step(0.5, fract(local.x * 2.4));
    float zebra = max(zebraX, zebraZ) * inside;

    vec3 asphalt = uGround * 1.45;
    vec3 col = mix(uGround, asphalt, road);
    col = mix(col, uGround * 2.2 + 0.015, sidewalk);
    col = mix(col, mix(vec3(0.75), uStreet, 0.6) * mix(0.55, 0.3, uLit), centre);
    col = mix(col, vec3(0.7) * mix(0.5, 0.22, uLit), zebra);
    float pool = road * (1.0 - crossing) * smoothstep(hw, 0.0, onX > 0.5 ? d.x : d.y);
    col += uStreet * pool * 0.05 * uLit;
    gl_FragColor = vec4(applyFog(col, vDist), 1.0);
    #include <colorspace_fragment>
  }
`;

export const waterFragment = /* glsl */ `
  uniform vec3 uWater;
  uniform vec3 uGlint;
  uniform vec3 uSky;
  uniform float uTime;
  uniform float uLit;
  uniform float uShore;
  varying vec3 vWorld;
  varying float vDist;
  ${fogChunk}
  ${hashChunk}
  void main() {
    vec3 v = normalize(cameraPosition - vWorld);
    float fres = pow(1.0 - clamp(v.y, 0.0, 1.0), 4.0);
    float ripple = sin(vWorld.x * 0.9 + uTime * 1.3) * 0.5 + sin(vWorld.x * 2.3 - uTime * 0.7 + vWorld.z * 0.4) * 0.5;
    float fromShore = max(uShore - vWorld.z, 0.0);
    float x = vWorld.x + ripple * 0.5;
    float column = smoothstep(0.62, 1.0, hash12(vec2(floor(x * 0.8), 7.0))) * (0.55 + 0.45 * sin(x * 7.0));
    float breakup = smoothstep(0.25, 0.55, fract(vWorld.z * 0.85 + ripple * 0.35 + uTime * 0.12));
    float reach = exp(-fromShore * 0.014);
    vec3 reflected = uGlint * column * breakup * reach * mix(0.05, 0.85, uLit);
    float sparkle = smoothstep(0.86, 1.0, ripple) * 0.04;
    vec3 col = mix(uWater, uSky * 0.55, fres * 0.65);
    float haze = exp(-pow(uFogDensity * 0.55 * vDist, 2.0));
    vec3 lights = (reflected * 1.6 + uGlint * sparkle * (0.2 + uLit)) * haze;
    gl_FragColor = vec4(applyFog(col, vDist) + lights, 1.0);
    #include <colorspace_fragment>
  }
`;


