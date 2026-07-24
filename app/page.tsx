"use client";

import Link from "next/link";
import { AICommand } from "@/components/AICommand";
import { useApp } from "@/components/AppProvider";
import { BatchCard } from "@/components/BatchCard";
import { dashboardPipeline, inventoryTotal, pipelineCounts } from "@/lib/selectors";

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);

const unitLabel = (value: number, singular: string, plural = `${singular}s`) =>
  value === 1 ? singular : plural;

export default function DashboardPage() {
  const { state, ready } = useApp();
  if (!ready) return null;

  const active = state.batches.filter((b) => b.phase !== "done");
  const p = pipelineCounts(state);
  const metrics = dashboardPipeline(state);
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
        <div className="eyebrow">Grow overview</div>
        <h2>What&apos;s growing right now.</h2>
        <p>Your cultures, grain spawn, active tubs, and dry stock in one place.</p>
        <div className="hero-stats">
          <div className="hero-stat"><b>{active.length}</b><span>Active grows</span></div>
          <div className="hero-stat"><b>{metrics.fruitingContainers}</b><span>Fruiting tubs</span></div>
          <div className="hero-stat"><b>{formatNumber(total)} g</b><span>Dry stock</span></div>
        </div>
      </div>

      <AICommand />

      <div className="section-head"><h3>Grow pipeline</h3><span>What stage everything is in</span></div>
      <div className="pipeline">
        <div className="stage">
          <div className="stage-icon">🧫</div>
          <strong>{formatNumber(metrics.agarPlates)} <em>{unitLabel(metrics.agarPlates, "plate")}</em></strong>
          <small>Agar · {p.agar.room} room / {p.agar.fridge} fridge</small>
        </div>
        <div className="stage">
          <div className="stage-icon">💉</div>
          <strong>{formatNumber(metrics.lcMl)} <em>mL</em></strong>
          <small>LC · {p.lc.room} room / {p.lc.fridge} fridge</small>
        </div>
        <div className="stage">
          <div className="stage-icon">🌾</div>
          <strong>{formatNumber(metrics.grainUnits)} <em>{unitLabel(metrics.grainUnits, "jar/bag", "jars/bags")}</em></strong>
          <small>Grain spawn · about {formatNumber(metrics.grainQuarts)} qt total</small>
        </div>
        <div className="stage stage-subset">
          <div className="stage-icon">🤲</div>
          <strong>{formatNumber(metrics.breakUnits)} <em>shaken</em></strong>
          <small>{formatNumber(metrics.breakQuarts)} qt has had a break &amp; shake</small>
        </div>
        <div className="stage">
          <div className="stage-icon">🪵</div>
          <strong>{formatNumber(metrics.bulkContainers)} <em>{unitLabel(metrics.bulkContainers, "tub")}</em></strong>
          <small>Spawned to bulk · {formatNumber(metrics.bulkQuarts)} qt spawn</small>
        </div>
        <div className="stage">
          <div className="stage-icon">🍄</div>
          <strong>{formatNumber(metrics.fruitingContainers)} <em>{unitLabel(metrics.fruitingContainers, "tub")}</em></strong>
          <small>Fruiting · {martha.length} Martha / {outside.length} outside</small>
        </div>
        <div className="stage">
          <div className="stage-icon">🌬️</div>
          <strong>{formatNumber(metrics.dryingWetGrams)} <em>g wet</em></strong>
          <small>{metrics.dryingBatches} {unitLabel(metrics.dryingBatches, "flush", "flushes")} drying</small>
        </div>
        <div className="stage stage-inventory">
          <div className="stage-icon">📦</div>
          <strong>{formatNumber(total)} <em>g dry</em></strong>
          <small>Dry stock on hand</small>
        </div>
      </div>

      <div className="section-head"><h3>Culture library</h3></div>
      <div className="inventory-card">
        {state.cultures.length ? state.cultures.map((c) => (
          <Link key={c.id} href={`/cultures/${c.id}`} className="inventory-row clickable">
            <div><b>{c.id}</b><span>{c.species} · {c.type === "agar" ? "Agar" : "LC"} · {c.storage === "fridge" ? "In the fridge" : "At room temp"}</span></div>
            <strong>{formatNumber(c.qty)} {c.type === "agar" ? unitLabel(c.qty, "plate") : "mL"}</strong>
          </Link>
        )) : <div className="empty-note">No cultures logged yet.</div>}
      </div>

      <div className="section-head"><h3>Active grows</h3><Link className="link" href="/batches">See all</Link></div>
      <div className="batches">
        {active.length ? active.slice(0, 4).map((b) => <BatchCard key={b.id} batch={b} />) : <div className="empty-note">Nothing active yet. Use Quick Log to start a grow.</div>}
      </div>

      <div className="section-head"><h3>Dry stock</h3><Link className="link" href="/inventory">View all</Link></div>
      <div className="inventory-card">
        {Object.keys(state.inventory).length ? Object.entries(state.inventory).map(([sp, g]) => (
          <div className="inventory-row" key={sp}><div><b>{sp}</b><span>Dried mushrooms on hand</span></div><strong>{formatNumber(g)} g</strong></div>
        )) : <div className="empty-note">No dry stock yet. It fills in when you log a dry weight.</div>}
      </div>
    </>
  );
}
