"use client";

import { useApp } from "@/components/AppProvider";
import { BatchCard } from "@/components/BatchCard";

export default function BatchesPage() {
  const { state, ready } = useApp();
  if (!ready) return null;

  const active = state.batches.filter((b) => b.phase !== "done");
  const done = state.batches.filter((b) => b.phase === "done");

  return (
    <>
      <div className="top">
        <div>
          <h2 className="page-title">Batches</h2>
          <div className="page-sub">Every active cultivation batch</div>
        </div>
        <div className="avatar">🗂️</div>
      </div>
      <div className="batches">
        {active.length ? (
          active.map((b) => <BatchCard key={b.id} batch={b} />)
        ) : (
          <div className="empty-note">No active batches yet.</div>
        )}
      </div>
      {done.length > 0 && (
        <>
          <div className="section-head">
            <h3>Completed</h3>
            <span>{done.length}</span>
          </div>
          <div className="batches">
            {done.map((b) => (
              <BatchCard key={b.id} batch={b} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
