import { mulberry32 } from "@/lib/random";

type Tower = { x: number; width: number; height: number };

function towers(): Tower[] {
  const rng = mulberry32(604);
  const result: Tower[] = [];
  let x = 0;
  while (x < 1600) {
    const width = 18 + rng() * 34;
    const centre = Math.exp(-(((x - 760) / 380) ** 2));
    result.push({ x, width, height: 40 + centre * 260 * (0.45 + rng() * 0.55) + rng() * 40 });
    x += width + 2 + rng() * 6;
  }
  return result;
}

const skyline = towers();

export function SkylineFallback() {
  return (
    <div className="city-layer" aria-hidden="true" data-testid="skyline-fallback">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, var(--sky-top) 0%, var(--sky-mid) 48%, var(--sky-horizon) 72%, var(--bg) 100%)",
        }}
      />
      <svg className="absolute inset-x-0 bottom-0 h-[62vh] w-full" viewBox="0 0 1600 600" preserveAspectRatio="xMidYMax slice">
        <path
          d="M0 330 L120 250 L210 290 L330 170 L430 240 L520 200 L640 120 L760 210 L850 160 L980 240 L1090 150 L1210 230 L1330 180 L1450 250 L1600 210 L1600 600 L0 600 Z"
          fill="var(--ridge-far)"
          opacity="0.85"
        />
        <path
          d="M0 380 L150 300 L260 350 L380 260 L500 330 L620 280 L730 340 L860 270 L990 330 L1120 280 L1250 340 L1400 300 L1600 350 L1600 600 L0 600 Z"
          fill="var(--ridge)"
        />
        <g fill="var(--tower)">
          {skyline.map((t) => (
            <rect key={t.x} x={t.x} y={600 - t.height} width={t.width} height={t.height} />
          ))}
        </g>
        <rect x="0" y="588" width="1600" height="12" fill="var(--bg)" />
      </svg>
    </div>
  );
}
