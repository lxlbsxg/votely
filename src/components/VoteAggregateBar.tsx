"use client";

import { useState } from "react";
import type { VoteAggregate } from "@/lib/actions/asset";

type Props = {
  aggregate: VoteAggregate;
};

// Green/red fails the dataviz palette validator's CVD-separation check on
// hue alone (protan/deutan), same as the candlestick chart. Here the
// mitigation is fixed left/right position + direct percentage labels + a
// text legend, rather than shape - identity never depends on color alone.

export function VoteAggregateBar({ aggregate }: Props) {
  const [hovered, setHovered] = useState<"support" | "oppose" | null>(null);

  if (aggregate.total === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No votes on this asset&apos;s opinions yet.
      </p>
    );
  }

  return (
    <div className="vote-bar">
      <style>{`
        .vote-bar {
          --surface: #fcfcfb;
          --support: #006300;
          --oppose: #d03b3b;
          --text-secondary: #52514e;
        }
        @media (prefers-color-scheme: dark) {
          :root:where(:not([data-theme="light"])) .vote-bar {
            --surface: #1a1a19;
            --support: #0ca30c;
            --oppose: #e66767;
            --text-secondary: #c3c2b7;
          }
        }
        :root[data-theme="dark"] .vote-bar {
          --surface: #1a1a19;
          --support: #0ca30c;
          --oppose: #e66767;
          --text-secondary: #c3c2b7;
        }
      `}</style>

      <div className="flex h-6 w-full overflow-hidden rounded-full">
        <div
          className="flex items-center justify-start pl-2 text-xs font-medium text-white transition-opacity"
          style={{
            width: `${aggregate.supportPct}%`,
            backgroundColor: "var(--support)",
            marginRight: 2,
            opacity: hovered === "oppose" ? 0.6 : 1,
          }}
          onPointerEnter={() => setHovered("support")}
          onPointerLeave={() => setHovered(null)}
          title={`${aggregate.support} support`}
        >
          {aggregate.supportPct >= 12 && `${Math.round(aggregate.supportPct)}%`}
        </div>
        <div
          className="flex items-center justify-end pr-2 text-xs font-medium text-white transition-opacity"
          style={{
            width: `${aggregate.opposePct}%`,
            backgroundColor: "var(--oppose)",
            opacity: hovered === "support" ? 0.6 : 1,
          }}
          onPointerEnter={() => setHovered("oppose")}
          onPointerLeave={() => setHovered(null)}
          title={`${aggregate.oppose} oppose`}
        >
          {aggregate.opposePct >= 12 && `${Math.round(aggregate.opposePct)}%`}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-4 text-xs" style={{ color: "var(--text-secondary)" }}>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: "var(--support)" }}
          />
          支持 {aggregate.support} ({Math.round(aggregate.supportPct)}%)
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: "var(--oppose)" }}
          />
          反对 {aggregate.oppose} ({Math.round(aggregate.opposePct)}%)
        </span>
      </div>
    </div>
  );
}
