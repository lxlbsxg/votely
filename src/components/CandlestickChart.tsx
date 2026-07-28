"use client";

import { useMemo, useRef, useState } from "react";
import type { Candle } from "@/lib/market";

type Props = {
  candles: Candle[];
};

const WIDTH = 720;
const HEIGHT = 320;
const PADDING = { top: 16, right: 16, bottom: 28, left: 56 };

function formatDate(unixSeconds: number) {
  return new Date(unixSeconds * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatPrice(value: number) {
  return value >= 1000
    ? value.toLocaleString(undefined, { maximumFractionDigits: 0 })
    : value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function CandlestickChart({ candles }: Props) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const { min, max } = useMemo(() => {
    if (candles.length === 0) return { min: 0, max: 1 };
    const lows = candles.map((c) => c.low);
    const highs = candles.map((c) => c.high);
    const rawMin = Math.min(...lows);
    const rawMax = Math.max(...highs);
    const pad = (rawMax - rawMin) * 0.05 || rawMax * 0.05 || 1;
    return { min: rawMin - pad, max: rawMax + pad };
  }, [candles]);

  const yScale = (price: number) =>
    PADDING.top + (1 - (price - min) / (max - min)) * plotHeight;

  const slotWidth = candles.length > 0 ? plotWidth / candles.length : plotWidth;
  const xForIndex = (i: number) => PADDING.left + slotWidth * (i + 0.5);
  const candleWidth = Math.max(2, Math.min(10, slotWidth * 0.6));

  function handleMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!svgRef.current || candles.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const relative = (x - PADDING.left) / slotWidth;
    const index = Math.min(
      candles.length - 1,
      Math.max(0, Math.round(relative - 0.5)),
    );
    setHoverIndex(index);
  }

  const gridLines = 4;
  const gridValues = Array.from({ length: gridLines + 1 }, (_, i) =>
    min + ((max - min) * i) / gridLines,
  );

  const hovered = hoverIndex !== null ? candles[hoverIndex] : null;

  return (
    <div className="candle-chart">
      <style>{`
        .candle-chart {
          --surface: #fcfcfb;
          --grid: #e1e0d9;
          --axis: #c3c2b7;
          --text-secondary: #52514e;
          --text-muted: #898781;
          --up: #006300;
          --down: #d03b3b;
          position: relative;
        }
        @media (prefers-color-scheme: dark) {
          :root:where(:not([data-theme="light"])) .candle-chart {
            --surface: #1a1a19;
            --grid: #2c2c2a;
            --axis: #383835;
            --text-secondary: #c3c2b7;
            --text-muted: #898781;
            --up: #0ca30c;
            --down: #e66767;
          }
        }
        :root[data-theme="dark"] .candle-chart {
          --surface: #1a1a19;
          --grid: #2c2c2a;
          --axis: #383835;
          --text-secondary: #c3c2b7;
          --text-muted: #898781;
          --up: #0ca30c;
          --down: #e66767;
        }
        .candle-chart svg { width: 100%; height: auto; display: block; }
        .candle-chart text { fill: var(--text-muted); font-size: 11px; }
        .candle-tooltip {
          position: absolute;
          top: 8px;
          left: 8px;
          background: var(--surface);
          border: 1px solid var(--grid);
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 12px;
          color: var(--text-secondary);
          pointer-events: none;
        }
        .candle-tooltip strong { color: var(--text-secondary); }
      `}</style>

      {hovered && (
        <div className="candle-tooltip">
          <div>{formatDate(hovered.time)}</div>
          <div>
            O <strong>{formatPrice(hovered.open)}</strong> H{" "}
            <strong>{formatPrice(hovered.high)}</strong> L{" "}
            <strong>{formatPrice(hovered.low)}</strong> C{" "}
            <strong>{formatPrice(hovered.close)}</strong>
          </div>
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        onPointerMove={handleMove}
        onPointerLeave={() => setHoverIndex(null)}
      >
        {gridValues.map((value, i) => {
          const y = yScale(value);
          return (
            <g key={i}>
              <line
                x1={PADDING.left}
                x2={WIDTH - PADDING.right}
                y1={y}
                y2={y}
                stroke="var(--grid)"
                strokeWidth={1}
              />
              <text x={4} y={y + 4}>
                {formatPrice(value)}
              </text>
            </g>
          );
        })}

        {candles.map((candle, i) => {
          const x = xForIndex(i);
          const isUp = candle.close >= candle.open;
          const color = isUp ? "var(--up)" : "var(--down)";
          const bodyTop = yScale(Math.max(candle.open, candle.close));
          const bodyBottom = yScale(Math.min(candle.open, candle.close));
          const bodyHeight = Math.max(1, bodyBottom - bodyTop);

          return (
            <g key={i} opacity={hoverIndex === null || hoverIndex === i ? 1 : 0.55}>
              <line
                x1={x}
                x2={x}
                y1={yScale(candle.high)}
                y2={yScale(candle.low)}
                stroke={color}
                strokeWidth={1.5}
              />
              {/* Filled vs. hollow body (not just hue) distinguishes up/down
                  days - green/red alone fails CVD separation for protan/
                  deutan viewers (validated with dataviz's palette script). */}
              <rect
                x={x - candleWidth / 2}
                y={bodyTop}
                width={candleWidth}
                height={bodyHeight}
                fill={isUp ? color : "var(--surface)"}
                stroke={color}
                strokeWidth={isUp ? 0 : 1.5}
                rx={1}
              />
            </g>
          );
        })}

        {hoverIndex !== null && (
          <line
            x1={xForIndex(hoverIndex)}
            x2={xForIndex(hoverIndex)}
            y1={PADDING.top}
            y2={HEIGHT - PADDING.bottom}
            stroke="var(--axis)"
            strokeWidth={1}
            strokeDasharray="2,2"
          />
        )}

        <line
          x1={PADDING.left}
          x2={WIDTH - PADDING.right}
          y1={HEIGHT - PADDING.bottom}
          y2={HEIGHT - PADDING.bottom}
          stroke="var(--axis)"
          strokeWidth={1}
        />

        {candles.length > 0 && (
          <>
            <text x={PADDING.left} y={HEIGHT - 6}>
              {formatDate(candles[0].time)}
            </text>
            <text x={WIDTH - PADDING.right - 40} y={HEIGHT - 6}>
              {formatDate(candles[candles.length - 1].time)}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
