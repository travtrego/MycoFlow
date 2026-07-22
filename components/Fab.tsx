"use client";

import { useRouter } from "next/navigation";
import { useApp } from "./AppProvider";
import { emptySlots } from "@/lib/selectors";
import type { ModalValues } from "@/lib/sheet-types";
import type { BatchPhase } from "@/lib/types";

const UNIT_OPTIONS = [
  { value: "jars", label: "Jars" },
  { value: "bags", label: "Bags" },
  { value: "tubs", label: "Tubs" },
  { value: "bins", label: "Bins" },
  { value: "trays", label: "Trays" },
];

const STAGE_COPY: Record<Exclude<BatchPhase, "done">, { label: string; title: string; sub: string }> = {
  grain: { label: "Grain", title: "Add at grain", sub: "Jars/bags currently colonizing grain." },
  break: { label: "Break & shake", title: "Add at break & shake", sub: "Grain that's just been broken and shaken." },
  bulk: { label: "Bulk (colonized)", title: "Add at bulk", sub: "Spawned into bulk substrate, colonizing." },
  fruiting: { label: "Fruiting", title: "Add at fruiting", sub: "Already fruiting — pick where it's sitting." },
  drying: { label: "Drying", title: "Add at drying", sub: "Just harvested and drying — log the fresh weight." },
};

export function Fab() {
  const { state, openSheet, closeSheet, addCulture, addBatchAtStage, addDriedStock, toast } = useApp();
  const router = useRouter();

  const openNewCultureForm = () => {
    openSheet({
      mode: "form",
      title: "New culture",
      sub: "Add an agar plate or liquid culture jar.",
      submitLabel: "Add culture",
      fields: [
        { key: "species", label: "Species", type: "text", placeholder: "e.g. Golden Teacher" },
        {
          key: "type",
          label: "Type",
          type: "select",
          options: [
            { value: "agar", label: "Agar" },
            { value: "lc", label: "Liquid culture" },
          ],
        },
        {
          key: "storage",
          label: "Storage",
          type: "select",
          options: [
            { value: "room", label: "Room temperature" },
            { value: "fridge", label: "Refrigerated" },
          ],
        },
        { key: "qty", label: "Quantity", type: "number", value: 1 },
      ],
      onSubmit: (v: ModalValues) => {
        if (!v.species) {
          toast("Enter a species name");
          return;
        }
        const id = addCulture({
          species: String(v.species),
          type: v.type === "lc" ? "lc" : "agar",
          storage: v.storage === "fridge" ? "fridge" : "room",
          qty: Number(v.qty) || 1,
        });
        closeSheet();
        toast(`${id} added`);
      },
    });
  };

  const openStageForm = (phase: Exclude<BatchPhase, "done">) => {
    const needsLocation = phase === "fruiting" || phase === "drying";
    const empties = emptySlots(state);
    if (needsLocation && !empties.length) {
      toast("No empty locations available");
      return;
    }
    const copy = STAGE_COPY[phase];
    openSheet({
      mode: "form",
      title: copy.title,
      sub: copy.sub,
      submitLabel: "Add batch",
      fields: [
        { key: "species", label: "Species", type: "text", placeholder: "e.g. B+" },
        { key: "qty", label: "Jars / tubs / trays", type: "number", value: 4 },
        { key: "unit", label: "Unit", type: "select", options: UNIT_OPTIONS },
        ...(needsLocation
          ? [
              {
                key: "location",
                label: "Location",
                type: "select" as const,
                options: empties.map((s) => ({ value: s.id, label: `${s.group} · ${s.label}` })),
              },
            ]
          : []),
        ...(phase === "drying"
          ? [{ key: "freshWeight", label: "Fresh weight (g)", type: "number" as const }]
          : []),
      ],
      onSubmit: (v: ModalValues) => {
        if (!v.species) {
          toast("Enter a species name");
          return;
        }
        if (phase === "drying" && !v.freshWeight) {
          toast("Enter a fresh weight");
          return;
        }
        const result = addBatchAtStage({
          species: String(v.species),
          qty: Number(v.qty) || 1,
          unit: String(v.unit || "jars"),
          phase,
          location: v.location ? String(v.location) : null,
          freshWeight: Number(v.freshWeight) || undefined,
        });
        if ("error" in result) {
          toast(result.error);
          return;
        }
        closeSheet();
        router.push(`/batches/${result.id}`);
        toast(`${result.id} added`);
      },
    });
  };

  const openDriedStockForm = () => {
    openSheet({
      mode: "form",
      title: "Add dried stock",
      sub: "Dried mushrooms you already have on hand, not tied to a batch.",
      submitLabel: "Add to inventory",
      fields: [
        { key: "species", label: "Species", type: "text", placeholder: "e.g. Golden Teacher" },
        { key: "grams", label: "Dry weight (g)", type: "number" },
      ],
      onSubmit: (v: ModalValues) => {
        if (!v.species) {
          toast("Enter a species name");
          return;
        }
        if (!v.grams) {
          toast("Enter a dry weight");
          return;
        }
        addDriedStock(String(v.species), Number(v.grams));
        closeSheet();
        toast(`${v.grams} g added to inventory`);
      },
    });
  };

  const openStagePicker = () => {
    openSheet({
      mode: "actions",
      title: "New batch",
      sub: "What stage is it at right now?",
      actions: (["grain", "break", "bulk", "fruiting", "drying"] as const).map((phase) => ({
        label: STAGE_COPY[phase].label,
        onClick: () => {
          closeSheet();
          openStageForm(phase);
        },
      })),
    });
  };

  const openActionSheet = () => {
    openSheet({
      mode: "actions",
      title: "Add to lab",
      sub: "What are you adding?",
      actions: [
        {
          label: "New culture (agar / LC)",
          onClick: () => {
            closeSheet();
            openNewCultureForm();
          },
        },
        {
          label: "New batch (any stage)",
          onClick: () => {
            closeSheet();
            openStagePicker();
          },
        },
        {
          label: "Dried stock already on hand",
          onClick: () => {
            closeSheet();
            openDriedStockForm();
          },
        },
      ],
    });
  };

  return (
    <button className="fab" onClick={openActionSheet} aria-label="Add">
      +
    </button>
  );
}
