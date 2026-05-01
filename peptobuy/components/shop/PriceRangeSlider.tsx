"use client";

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

const THUMB =
  "pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent " +
  "[&::-webkit-slider-thumb]:pointer-events-auto " +
  "[&::-webkit-slider-thumb]:appearance-none " +
  "[&::-webkit-slider-thumb]:h-[18px] " +
  "[&::-webkit-slider-thumb]:w-[18px] " +
  "[&::-webkit-slider-thumb]:rounded-full " +
  "[&::-webkit-slider-thumb]:bg-white " +
  "[&::-webkit-slider-thumb]:border-2 " +
  "[&::-webkit-slider-thumb]:border-accent " +
  "[&::-webkit-slider-thumb]:cursor-grab " +
  "[&::-webkit-slider-thumb]:shadow-[0_0_0_3px_rgba(255,45,120,0.2)] " +
  "[&::-webkit-slider-thumb]:transition-shadow " +
  "[&::-webkit-slider-thumb]:hover:shadow-[0_0_0_5px_rgba(255,45,120,0.25)] " +
  "[&::-webkit-slider-runnable-track]:bg-transparent " +
  "[&::-moz-range-thumb]:pointer-events-auto " +
  "[&::-moz-range-thumb]:h-[18px] " +
  "[&::-moz-range-thumb]:w-[18px] " +
  "[&::-moz-range-thumb]:rounded-full " +
  "[&::-moz-range-thumb]:bg-white " +
  "[&::-moz-range-thumb]:border-2 " +
  "[&::-moz-range-thumb]:border-accent " +
  "[&::-moz-range-thumb]:cursor-grab " +
  "[&::-moz-range-track]:bg-transparent";

const MIN_GAP = 5;

export default function PriceRangeSlider({
  min,
  max,
  value,
  onChange,
}: PriceRangeSliderProps) {
  const leftPct = ((value[0] - min) / (max - min)) * 100;
  const rightPct = 100 - ((value[1] - min) / (max - min)) * 100;

  return (
    <div>
      {/* Track + thumbs */}
      <div className="relative mb-5 h-5">
        {/* Background track */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-surface-2" />
        {/* Active range */}
        <div
          className="pointer-events-none absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-accent"
          style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
        />

        {/* Min thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value[0]}
          onChange={(e) => {
            const v = Math.min(Number(e.target.value), value[1] - MIN_GAP);
            onChange([v, value[1]]);
          }}
          className={THUMB}
          style={{ zIndex: value[0] > max - 10 ? 5 : 3 }}
        />

        {/* Max thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value[1]}
          onChange={(e) => {
            const v = Math.max(Number(e.target.value), value[0] + MIN_GAP);
            onChange([value[0], v]);
          }}
          className={THUMB}
          style={{ zIndex: 4 }}
        />
      </div>

      {/* Value labels */}
      <div className="flex items-center justify-between">
        <span className="rounded-md border border-border bg-surface-2 px-2.5 py-1 font-mono text-xs font-semibold text-zinc-700">
          ${value[0]}
        </span>
        <span className="text-xs text-zinc-300">—</span>
        <span className="rounded-md border border-border bg-surface-2 px-2.5 py-1 font-mono text-xs font-semibold text-zinc-700">
          ${value[1]}
        </span>
      </div>
    </div>
  );
}
