"use client";

import Link from "next/link";
import { phaseDisplay, slotLabel } from "@/lib/selectors";
import { todayStr } from "@/lib/format";
import type { Batch } from "@/lib/types";

export function BatchCard({ batch }: { batch: Batch }) {
  const label = phaseDisplay(batch);
  const dryYield = batch.flushes.reduce((a, f) => a + (f.dryWeight || 0), 0);
  return (
    <Link href={`/batches/${batch.id}`} className="batch">
      <div className="batch-top">
        <div className="batch-name">
          <b>{batch.id}</b>
          <span>
            {batch.species} · {batch.qty} {batch.qtyUnit}
          </span>
        </div>
        <div className={`pill${batch.phase === "drying" ? " drying" : ""}`}>{label.pill}</div>
      </div>
      <div className="batch-meta">
        <div className="meta">
          <small>Stage</small>
          <b>{label.stage}</b>
        </div>
        <div className="meta">
          <small>Location</small>
          <b>{batch.location ? slotLabel(batch.location) : "Unassigned"}</b>
        </div>
        <div className="meta">
          <small>{batch.flushes.length ? "Dry yield" : "Since"}</small>
          <b>{batch.flushes.length ? `${dryYield} g` : todayStr()}</b>
        </div>
      </div>
    </Link>
  );
}
