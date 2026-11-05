import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTs,
  {
    // The scene graph is imperative by design: R3F mutates uniforms, cameras and
    // matrices from effects and useFrame. React Compiler immutability rules don't
    // model GPU-side state, so they're scoped off for the city only.
    files: ["src/components/city/**/*.{ts,tsx}"],
    rules: { "react-hooks/immutability": "off" },
  },
  { ignores: [".next/**", "out/**", "node_modules/**", "next-env.d.ts", "test-results/**", "playwright-report/**"] },
];

export default config;
