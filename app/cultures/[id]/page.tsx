"use client";

import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";

export default function CultureDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { state, ready, openSheet, closeSheet, inoculateToGrain, toggleCultureStorage, discardCulture, toast } =
    useApp();

  if (!ready) return null;
  const c = state.cultures.find((x) => x.id === id);
  if (!c) return <div className="empty-note">Culture not found.</div>;

  const openInoculateForm = () => {
    openSheet({
      mode: "form",
      title: "Inoculate to grain",
      sub: `From ${c.id} · ${c.species}`,
      submitLabel: "Start grain batch",
      fields: [
        { key: "qty", label: "Jars / bags", type: "number", value: 4 },
        {
          key: "unit",
          label: "Unit",
          type: "select",
          options: [
            { value: "jars", label: "Jars" },
            { value: "bags", label: "Bags" },
          ],
        },
      ],
      onSubmit: (v) => {
        const newId = inoculateToGrain(c.id, Number(v.qty) || 1, String(v.unit || "jars"));
        closeSheet();
        if (newId) {
          router.push(`/batches/${newId}`);
          toast(`${newId} started`);
        }
      },
    });
  };

  return (
    <>
      <div className="top">
        <div>
          <button className="back" onClick={() => router.push("/")}>
            ← Back
          </button>
          <h2 className="page-title">{c.id}</h2>
          <div className="page-sub">
            {c.species} · {c.type === "agar" ? "Agar plates" : "Liquid culture"}
          </div>
        </div>
        <div className="avatar">🧫</div>
      </div>
      <div className="detail-card">
        <div className="eyebrow">Storage</div>
        <h2 style={{ margin: "8px 0 4px" }}>{c.storage === "fridge" ? "Refrigerated" : "Room temperature"}</h2>
        <p style={{ margin: 0, color: "var(--muted)", fontSize: ".78rem" }}>
          {c.qty} on hand · stored since {c.date}
        </p>
      </div>
      <div className="action-btns">
        <button className="action-btn" onClick={openInoculateForm}>
          Inoculate to grain →
        </button>
        <button className="action-btn secondary" onClick={() => toggleCultureStorage(c.id)}>
          Move to {c.storage === "fridge" ? "room temperature" : "refrigerator"}
        </button>
        <button
          className="action-btn danger"
          onClick={() => {
            discardCulture(c.id);
            router.push("/");
            toast("Culture discarded");
          }}
        >
          Discard culture
        </button>
      </div>
    </>
  );
}
