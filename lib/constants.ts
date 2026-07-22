import type { BatchPhase, LocationSlot } from "./types";

export const LOCATION_GROUPS: { group: string; slots: { id: string; label: string }[] }[] = [
  {
    group: "Martha tent",
    slots: [
      { id: "martha-1", label: "Shelf 1" },
      { id: "martha-2", label: "Shelf 2" },
      { id: "martha-3", label: "Shelf 3" },
      { id: "martha-4", label: "Shelf 4" },
    ],
  },
  { group: "Outside Martha", slots: [{ id: "outside", label: "Outside Martha" }] },
  {
    group: "80-qt chambers",
    slots: [
      { id: "chamber-1", label: "Chamber 1" },
      { id: "chamber-2", label: "Chamber 2" },
    ],
  },
];

export const ALL_SLOTS: LocationSlot[] = LOCATION_GROUPS.flatMap((g) =>
  g.slots.map((s) => ({ ...s, group: g.group }))
);

export const PHASE_LABEL: Record<BatchPhase, string> = {
  grain: "Grain colonization",
  break: "Break & shake",
  bulk: "Bulk colonizing",
  fruiting: "Fruiting",
  drying: "Drying",
  done: "Complete",
};

export const PHASE_ICON: Record<BatchPhase, string> = {
  grain: "🌾",
  break: "🤲",
  bulk: "🪵",
  fruiting: "🍄",
  drying: "🌬️",
  done: "✅",
};

export const STORAGE_KEY = "mycoflow-state-v1";
