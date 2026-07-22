"use client";

import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { BatchCard } from "@/components/BatchCard";
import { inventoryTotal, pipelineCounts } from "@/lib/selectors";

export default function DashboardPage() {
  const { state, ready } = useApp();
  if (!ready) return null;

  const active = state.batches.filter((b) => b.phase !== "done");
  const p = pipelineCounts(state);
  const total = inventoryTotal(state);
  const martha = active.filter((b) => b.location?.startsWith("martha"));
  const outside = active.filter((b) => b.location === "outside");

  return (
    <>
      <div className="top">
        <div className="brand">
          <h1>MycoFlow</h1>
          <p>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
        <div className="avatar">🍄</div>
      </div>

      <div className="hero">
        <div className="eyebrow">Cultivation overview</div>
        <h2>Your lab at a glance.</h2>
        <p>Current batch positions, active fruiting units, and dried inventory in one place.</p>
        <div className="hero-stats">
          <div className="hero-stat">
            <b>{active.length}</b>
            <span>Active batches</span>
          </div>
          <div className="hero-stat">
            <b>{p.fruiting}</b>
            <span>Fruiting units</span>
          </div>
          <div className="hero-stat">
            <b>{total} g</b>
            <span>Dried inventory</span>
          </div>
        </div>
      </div>

      <div className="section-head">
        <h3>Pipeline</h3>
        <span>Current quantities</span>
      </div>
      <div className="pipeline">
        <div className="stage">
          <div className="stage-icon">🧫</div>
          <strong>{p.agar.count}</strong>
          <small>
            Agar · {p.agar.room} room / {p.agar.fridge} fridge
          </small>
        </div>
        <div className="stage">
          <div className="stage-icon">💉</div>
          <strong>{p.lc.count}</strong>
          <small>
            LC · {p.lc.room} room / {p.lc.fridge} fridge
          </small>
        </div>
        <div className="stage">
          <div className="stage-icon">🌾</div>
          <strong>{p.grain}</strong>
          <small>Grain jars/bags</small>
        </div>
        <div className="stage">
          <div className="stage-icon">🤲</div>
          <strong>{p.brk}</strong>
          <small>Break & shake</small>
        </div>
        <div className="stage">
          <div className="stage-icon">🪵</div>
          <strong>{p.bulk}</strong>
          <small>Bulk colonizing</small>
        </div>
        <div className="stage">
          <div className="stage-icon">🍄</div>
          <strong>{p.fruiting}</strong>
          <small>
            Fruiting · {martha.length} Martha / {outside.length} outside
          </small>
        </div>
        <div className="stage">
          <div className="stage-icon">🌬️</div>
          <strong>{p.drying}</strong>
          <small>Drying</small>
        </div>
      </div>

      <div className="section-head">
        <h3>Culture storage</h3>
      </div>
      <div className="inventory-card">
        {state.cultures.length ? (
          state.cultures.map((c) => (
            <Link key={c.id} href={`/cultures/${c.id}`} className="inventory-row clickable">
              <div>
                <b>{c.id}</b>
                <span>
                  {c.species} · {c.type === "agar" ? "Agar" : "Liquid culture"} ·{" "}
                  {c.storage === "fridge" ? "Refrigerated" : "Room temp"}
                </span>
              </div>
              <strong>{c.qty}</strong>
            </Link>
          ))
        ) : (
          <div className="empty-note">No cultures yet. Tap + to add one.</div>
        )}
      </div>

      <div className="section-head">
        <h3>Active batches</h3>
        <Link className="link" href="/batches">
          See all
        </Link>
      </div>
      <div className="batches">
        {active.length ? (
          active.slice(0, 4).map((b) => <BatchCard key={b.id} batch={b} />)
        ) : (
          <div className="empty-note">No active batches. Tap + to start one.</div>
        )}
      </div>

      <div className="section-head">
        <h3>Dried inventory</h3>
        <Link className="link" href="/inventory">
          View all
        </Link>
      </div>
      <div className="inventory-card">
        {Object.keys(state.inventory).length ? (
          Object.entries(state.inventory).map(([sp, g]) => (
            <div className="inventory-row" key={sp}>
              <div>
                <b>{sp}</b>
                <span>Dried stock on hand</span>
              </div>
              <strong>{g} g</strong>
            </div>
          ))
        ) : (
          <div className="empty-note">No dried inventory yet. It fills in once you log a dry weight on a flush.</div>
        )}
      </div>
    </>
  );
}
