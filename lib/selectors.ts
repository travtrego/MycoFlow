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

function quartsPerUnit(unit: string): number | null {
  const normalized = unit.toLowerCase().replace(/-/g, " ").trim();
  const explicit = normalized.match(/(\d+(?:\.\d+)?)\s*(?:qt|quart)/);
  if (explicit) return Number(explicit[1]);
  if (/half\s*pint|1\/2\s*pint/.test(normalized)) return 0.25;
  if (/\bpint\b/.test(normalized)) return 0.5;
  if (/\bquart\b|\bqt\b/.test(normalized)) return 1;
  return null;
}

function batchQuarts(batch: Batch): number {
  const perUnit = quartsPerUnit(batch.qtyUnit);
  return perUnit === null ? 0 : batch.qty * perUnit;
}

export interface DashboardPipeline {
  agarPlates: number;
  lcMl: number;
  grainQuarts: number;
  grainUnits: number;
  breakQuarts: number;
  breakUnits: number;
  bulkQuarts: number;
  bulkContainers: number;
  fruitingContainers: number;
  dryingWetGrams: number;
  dryingBatches: number;
}

export function dashboardPipeline(state: AppState): DashboardPipeline {
  const active = state.batches.filter((b) => b.phase !== "done");
  const grainBatches = active.filter((b) => b.phase === "grain" || b.phase === "break");
  const breakBatches = active.filter((b) => b.phase === "break");
  const bulkBatches = active.filter((b) => b.phase === "bulk");
  const fruitingBatches = active.filter((b) => b.phase === "fruiting" || b.phase === "drying");
  const dryingBatches = active.filter((b) => b.phase === "drying");

  return {
    agarPlates: state.cultures
      .filter((c) => c.type === "agar")
      .reduce((total, culture) => total + culture.qty, 0),
    lcMl: state.cultures
      .filter((c) => c.type === "lc")
      .reduce((total, culture) => total + culture.qty, 0),
    grainQuarts: grainBatches.reduce((total, batch) => total + batchQuarts(batch), 0),
    grainUnits: grainBatches.reduce((total, batch) => total + batch.qty, 0),
    breakQuarts: breakBatches.reduce((total, batch) => total + batchQuarts(batch), 0),
    breakUnits: breakBatches.reduce((total, batch) => total + batch.qty, 0),
    bulkQuarts: bulkBatches.reduce((total, batch) => total + batchQuarts(batch), 0),
    bulkContainers: bulkBatches.reduce((total, batch) => total + batch.qty, 0),
    fruitingContainers: fruitingBatches.reduce((total, batch) => total + batch.qty, 0),
    dryingWetGrams: dryingBatches.reduce((total, batch) => {
      const activeFlush = [...batch.flushes].reverse().find((flush) => flush.dryWeight === null);
      return total + (activeFlush?.freshWeight ?? 0);
    }, 0),
    dryingBatches: dryingBatches.length,
  };
}

export function inventoryTotal(state: AppState): number {
  return Object.values(state.inventory).reduce((a, b) => a + b, 0);
}
