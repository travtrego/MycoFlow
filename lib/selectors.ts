import { ALL_SLOTS } from "./constants";
import type { AppState, Batch, LocationSlot } from "./types";

export function occupantOf(state: AppState, slotId: string): Batch | undefined {
  return state.batches.find((b) => b.location === slotId && b.phase !== "done");
}

export function emptySlots(state: AppState): LocationSlot[] {
  return ALL_SLOTS.filter((s) => !occupantOf(state, s.id));
}

export function slotLabel(slotId: string | null): string {
  if (!slotId) return "—";
  const s = ALL_SLOTS.find((x) => x.id === slotId);
  return s ? `${s.group} · ${s.label}` : "—";
}

export interface PhaseDisplay {
  pill: string;
  stage: string;
}

export function phaseDisplay(b: Batch): PhaseDisplay {
  if (b.phase === "grain") return { pill: "Grain", stage: "Grain colonization" };
  if (b.phase === "break") return { pill: "Break & shake", stage: "Break & shake" };
  if (b.phase === "bulk") return { pill: "Bulk colonizing", stage: "Bulk colonizing" };
  if (b.phase === "fruiting") {
    return b.flushes.length
      ? { pill: "Recovering", stage: `After Flush ${b.flushes.length}` }
      : { pill: "Fruiting", stage: "Fruiting" };
  }
  if (b.phase === "drying") return { pill: "Drying", stage: `Flush ${b.flushes.length} drying` };
  return { pill: "Complete", stage: "Complete" };
}

export interface PipelineCounts {
  agar: { count: number; room: number; fridge: number };
  lc: { count: number; room: number; fridge: number };
  grain: number;
  brk: number;
  bulk: number;
  fruiting: number;
  drying: number;
}

export function pipelineCounts(state: AppState): PipelineCounts {
  const active = state.batches.filter((b) => b.phase !== "done");
  const sum = (phase: Batch["phase"]) =>
    active.filter((b) => b.phase === phase).reduce((a, b) => a + b.qty, 0);
  const agar = state.cultures.filter((c) => c.type === "agar");
  const lc = state.cultures.filter((c) => c.type === "lc");
  return {
    agar: {
      count: agar.reduce((a, c) => a + c.qty, 0),
      room: agar.filter((c) => c.storage === "room").reduce((a, c) => a + c.qty, 0),
      fridge: agar.filter((c) => c.storage === "fridge").reduce((a, c) => a + c.qty, 0),
    },
    lc: {
      count: lc.reduce((a, c) => a + c.qty, 0),
      room: lc.filter((c) => c.storage === "room").reduce((a, c) => a + c.qty, 0),
      fridge: lc.filter((c) => c.storage === "fridge").reduce((a, c) => a + c.qty, 0),
    },
    grain: sum("grain"),
    brk: sum("break"),
    bulk: sum("bulk"),
    fruiting: active
      .filter((b) => b.phase === "fruiting" || b.phase === "drying")
      .reduce((a, b) => a + b.qty, 0),
    drying: sum("drying"),
  };
}

export function inventoryTotal(state: AppState): number {
  return Object.values(state.inventory).reduce((a, b) => a + b, 0);
}
