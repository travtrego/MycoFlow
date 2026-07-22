"use client";

import { useApp } from "@/components/AppProvider";
import { LOCATION_GROUPS } from "@/lib/constants";
import { phaseDisplay, occupantOf } from "@/lib/selectors";

export default function LocationsPage() {
  const { state, ready } = useApp();
  if (!ready) return null;

  const totalCultures = state.cultures.reduce((a, c) => a + c.qty, 0);

  return (
    <>
      <div className="top">
        <div>
          <h2 className="page-title">Lab Map</h2>
          <div className="page-sub">Where every active culture and fruiting unit is located</div>
        </div>
        <div className="avatar">⌖</div>
      </div>

      {LOCATION_GROUPS.map((g) => {
        const occupiedCount = g.slots.filter((s) => occupantOf(state, s.id)).length;
        return (
          <div key={g.group}>
            <div className="section-head">
              <h3>{g.group}</h3>
              <span>{occupiedCount} occupied</span>
            </div>
            <div className="detail-card">
              {g.slots.map((s) => {
                const occ = occupantOf(state, s.id);
                if (occ) {
                  const label = phaseDisplay(occ);
                  return (
                    <div className="timeline-item" key={s.id}>
                      <div className={`timeline-dot phase-${occ.phase}`} />
                      <div>
                        <b>
                          {s.label} · {occ.id}
                        </b>
                        <span>
                          {occ.species} · {label.stage}
                        </span>
                      </div>
                      <time>1 unit</time>
                    </div>
                  );
                }
                return (
                  <div className="timeline-item" key={s.id}>
                    <div className="timeline-dot empty" />
                    <div>
                      <b>{s.label} · Empty</b>
                      <span>Available space</span>
                    </div>
                    <time>0</time>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="section-head">
        <h3>Culture storage</h3>
        <span>{totalCultures} total</span>
      </div>
      <div className="detail-card">
        {(["fridge", "room"] as const).map((loc) => {
          const items = state.cultures.filter((c) => c.storage === loc);
          const agarCt = items.filter((c) => c.type === "agar").reduce((a, c) => a + c.qty, 0);
          const lcCt = items.filter((c) => c.type === "lc").reduce((a, c) => a + c.qty, 0);
          return (
            <div className="timeline-item" key={loc}>
              <div className="timeline-dot" />
              <div>
                <b>{loc === "fridge" ? "Refrigerator" : "Room temperature shelf"}</b>
                <span>
                  {agarCt} agar plates · {lcCt} liquid culture
                </span>
              </div>
              <time>{agarCt + lcCt}</time>
            </div>
          );
        })}
      </div>
    </>
  );
}
