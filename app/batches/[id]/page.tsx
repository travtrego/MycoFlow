"use client";

import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { emptySlots, phaseDisplay, slotLabel } from "@/lib/selectors";

export default function BatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const {
    state,
    ready,
    openSheet,
    closeSheet,
    advanceToBreak,
    spawnToBulk,
    moveToFruiting,
    moveLocation,
    harvestFlush,
    logDryWeight,
    retireBatch,
    toast,
  } = useApp();

  if (!ready) return null;
  const b = state.batches.find((x) => x.id === id);
  if (!b) return <div className="empty-note">Batch not found.</div>;

  const label = phaseDisplay(b);
  const empties = emptySlots(state);

  const openBulkForm = () => {
    openSheet({
      mode: "form",
      title: "Spawn to bulk",
      sub: `${b.id} · ${b.species}`,
      submitLabel: "Spawn to bulk",
      fields: [
        { key: "qty", label: "Tubs / containers", type: "number", value: b.qty },
        {
          key: "unit",
          label: "Unit",
          type: "select",
          options: [
            { value: "tubs", label: "Tubs" },
            { value: "bins", label: "Bins" },
            { value: "trays", label: "Trays" },
          ],
        },
      ],
      onSubmit: (v) => {
        spawnToBulk(b.id, Number(v.qty) || b.qty, String(v.unit || "tubs"));
        closeSheet();
        toast("Moved to bulk colonizing");
      },
    });
  };

  const openFruitForm = () => {
    if (!empties.length) {
      toast("No empty locations available");
      return;
    }
    openSheet({
      mode: "form",
      title: "Move to fruiting",
      sub: `${b.id} · assign a location`,
      submitLabel: "Move to fruiting",
      fields: [
        {
          key: "slot",
          label: "Location",
          type: "select",
          options: empties.map((s) => ({ value: s.id, label: `${s.group} · ${s.label}` })),
        },
      ],
      onSubmit: (v) => {
        moveToFruiting(b.id, String(v.slot));
        closeSheet();
        toast("Moved to fruiting");
      },
    });
  };

  const openMoveForm = () => {
    if (!empties.length) {
      toast("No empty locations available");
      return;
    }
    openSheet({
      mode: "form",
      title: "Move location",
      sub: `${b.id} · currently ${b.location ? slotLabel(b.location) : "unassigned"}`,
      submitLabel: "Move",
      fields: [
        {
          key: "slot",
          label: "New location",
          type: "select",
          options: empties.map((s) => ({ value: s.id, label: `${s.group} · ${s.label}` })),
        },
      ],
      onSubmit: (v) => {
        moveLocation(b.id, String(v.slot));
        closeSheet();
        toast("Location updated");
      },
    });
  };

  const openHarvestForm = () => {
    openSheet({
      mode: "form",
      title: "Harvest flush",
      sub: `${b.id} · Flush ${b.flushes.length + 1}`,
      submitLabel: "Log harvest",
      fields: [{ key: "fresh", label: "Fresh weight (g)", type: "number" }],
      onSubmit: (v) => {
        if (!v.fresh) {
          toast("Enter a fresh weight");
          return;
        }
        harvestFlush(b.id, Number(v.fresh));
        closeSheet();
        toast("Harvest logged");
      },
    });
  };

  const openDryForm = () => {
    const flush = b.flushes[b.flushes.length - 1];
    openSheet({
      mode: "form",
      title: "Log dry weight",
      sub: `${b.id} · Flush ${flush.n}`,
      submitLabel: "Add to inventory",
      fields: [{ key: "dry", label: "Dry weight (g)", type: "number" }],
      onSubmit: (v) => {
        if (!v.dry) {
          toast("Enter a dry weight");
          return;
        }
        logDryWeight(b.id, Number(v.dry));
        closeSheet();
        toast(`${v.dry} g added to inventory`);
      },
    });
  };

  return (
    <>
      <div className="top">
        <div>
          <button className="back" onClick={() => router.push("/batches")}>
            ← Back
          </button>
          <h2 className="page-title">{b.id}</h2>
          <div className="page-sub">
            {b.species} · {b.qty} {b.qtyUnit}
          </div>
        </div>
        <div className="avatar">🍄</div>
      </div>

      <div className={`detail-card stage-card phase-${b.phase}`}>
        <div className="eyebrow">Current stage</div>
        <h2 style={{ margin: "8px 0 4px" }}>{label.stage}</h2>
        <p style={{ margin: 0, color: "var(--muted)", fontSize: ".78rem" }}>Pill: {label.pill}</p>
      </div>

      <div className="detail-card">
        {b.location ? (
          <div className="timeline-item">
            <div className="timeline-dot" />
            <div>
              <b>{slotLabel(b.location)}</b>
              <span>Assigned location</span>
            </div>
            <time>Inside</time>
          </div>
        ) : (
          <div className="timeline-item">
            <div className="timeline-dot empty" />
            <div>
              <b>Unassigned</b>
              <span>No location set</span>
            </div>
            <time>—</time>
          </div>
        )}
      </div>

      <div className="action-btns">
        {b.phase === "grain" && (
          <button
            className="action-btn"
            onClick={() => {
              advanceToBreak(b.id);
              toast("Marked break & shake");
            }}
          >
            Mark break & shake done
          </button>
        )}
        {b.phase === "break" && (
          <button className="action-btn" onClick={openBulkForm}>
            Spawn to bulk →
          </button>
        )}
        {b.phase === "bulk" && (
          <button className="action-btn" onClick={openFruitForm}>
            Move to fruiting →
          </button>
        )}
        {b.phase === "fruiting" && (
          <>
            <button className="action-btn" onClick={openHarvestForm}>
              Harvest flush →
            </button>
            <button className="action-btn secondary" onClick={openMoveForm}>
              Move location
            </button>
            <button
              className="action-btn danger"
              onClick={() => {
                retireBatch(b.id);
                toast("Batch retired");
              }}
            >
              Retire batch
            </button>
          </>
        )}
        {b.phase === "drying" && (
          <button className="action-btn" onClick={openDryForm}>
            Log dry weight →
          </button>
        )}
      </div>

      {b.flushes.length > 0 && (
        <>
          <div className="section-head">
            <h3>Flushes</h3>
            <span>{b.flushes.length}</span>
          </div>
          <div className="detail-card">
            {b.flushes.map((f) => (
              <div className="timeline-item" key={f.n}>
                <div className="timeline-dot" />
                <div>
                  <b>Flush {f.n}</b>
                  <span>
                    {f.freshWeight} g fresh{f.dryWeight != null ? ` · ${f.dryWeight} g dry` : " · drying"}
                  </span>
                </div>
                <time>{f.harvestDate}</time>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="section-head">
        <h3>Batch timeline</h3>
        <span>Full history</span>
      </div>
      <div className="detail-card">
        {b.history.map((h, i) => (
          <div className="timeline-item" key={i}>
            <div className="timeline-dot" />
            <div>
              <b>{h.event}</b>
              <span>{h.sub || ""}</span>
            </div>
            <time>{h.date}</time>
          </div>
        ))}
      </div>
    </>
  );
}
