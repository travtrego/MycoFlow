import { nextId, todayStr } from "./format";
import { occupantOf, slotLabel } from "./selectors";
import type { AppState, Batch, BatchPhase, Culture, CultureType, StorageLocation } from "./types";

function logActivity(state: AppState, text: string, sub?: string): AppState {
  return { ...state, activity: [{ text, sub, date: todayStr() }, ...state.activity] };
}

function updateBatch(state: AppState, batchId: string, update: (b: Batch) => Batch): AppState {
  return { ...state, batches: state.batches.map((b) => (b.id === batchId ? update(b) : b)) };
}

export function addCulture(state: AppState, input: { species: string; type: CultureType; storage: StorageLocation; qty: number }): { state: AppState; id: string } {
  const { id, counters } = nextId(state.counters, input.type === "agar" ? "AGAR" : "LC", input.species);
  const culture: Culture = { id, species: input.species, type: input.type, storage: input.storage, qty: input.qty || 1, date: todayStr() };
  let next: AppState = { ...state, counters, cultures: [culture, ...state.cultures] };
  next = logActivity(next, `${id} added`, `${culture.qty} ${input.type === "agar" ? "plate(s)" : "jar(s)"} · ${input.storage === "fridge" ? "refrigerated" : "room temp"}`);
  return { state: next, id };
}

export function toggleCultureStorage(state: AppState, cultureId: string): AppState {
  const c = state.cultures.find((x) => x.id === cultureId);
  if (!c) return state;
  const storage: StorageLocation = c.storage === "fridge" ? "room" : "fridge";
  const next: AppState = { ...state, cultures: state.cultures.map((x) => (x.id === cultureId ? { ...x, storage } : x)) };
  return logActivity(next, `${c.id} moved to ${storage === "fridge" ? "refrigerator" : "room temperature"}`, `${c.qty} ${c.type === "agar" ? "plates" : "jar(s)"}`);
}

export function discardCulture(state: AppState, cultureId: string): AppState {
  const next: AppState = { ...state, cultures: state.cultures.filter((x) => x.id !== cultureId) };
  return logActivity(next, `${cultureId} discarded`);
}

export function inoculateToGrain(state: AppState, cultureId: string, qty: number, unit: string): { state: AppState; id: string } | null {
  const c = state.cultures.find((x) => x.id === cultureId);
  if (!c) return null;
  const { id, counters } = nextId(state.counters, "G", c.species);
  const batch: Batch = { id, species: c.species, phase: "grain", qty: qty || 1, qtyUnit: unit, location: null, flushes: [], history: [{ event: "Grain inoculated", sub: `From ${c.id} · ${qty || 1} ${unit}`, date: todayStr() }] };
  let next: AppState = { ...state, counters, batches: [batch, ...state.batches] };
  next = logActivity(next, `${id} grain inoculated`, `From ${c.id} · ${qty || 1} ${unit}`);
  return { state: next, id };
}

const STAGE_ADD_EVENT: Record<Exclude<BatchPhase, "done">, string> = { grain: "Grain inoculated", break: "Break & shake", bulk: "Spawned to bulk", fruiting: "Moved to fruiting", drying: "Flush 1 harvested" };

export function addBatchAtStage(state: AppState, input: { species: string; qty: number; unit: string; phase: Exclude<BatchPhase, "done">; location?: string | null; freshWeight?: number }): { state: AppState; id: string } | { error: string } {
  const needsLocation = input.phase === "fruiting" || input.phase === "drying";
  if (needsLocation) {
    if (!input.location) return { error: "Choose a location" };
    if (occupantOf(state, input.location)) return { error: "Slot occupied" };
  }
  const { id, counters } = nextId(state.counters, "G", input.species);
  const qty = input.qty || 1;
  const flushes = input.phase === "drying" ? [{ n: 1, freshWeight: input.freshWeight || 0, dryWeight: null, harvestDate: todayStr(), driedDate: null }] : [];
  const eventSub = input.phase === "drying" ? `${input.freshWeight || 0} g fresh · drying` : needsLocation ? slotLabel(input.location!) : `${qty} ${input.unit}`;
  const batch: Batch = { id, species: input.species, phase: input.phase, qty, qtyUnit: input.unit, location: needsLocation ? input.location! : null, flushes, history: [{ event: STAGE_ADD_EVENT[input.phase], sub: eventSub, date: todayStr() }] };
  let next: AppState = { ...state, counters, batches: [batch, ...state.batches] };
  next = logActivity(next, `${id} added`, `${STAGE_ADD_EVENT[input.phase]} · ${eventSub}`);
  return { state: next, id };
}

export function editBatch(state: AppState, batchId: string, input: { species?: string | null; qty?: number | null; unit?: string | null; phase?: Exclude<BatchPhase, "done"> | null; location?: string | null }): AppState {
  const batch = state.batches.find((item) => item.id === batchId);
  if (!batch) return state;
  const changes: string[] = [];
  if (input.species && input.species !== batch.species) changes.push(`species ${batch.species} → ${input.species}`);
  if (input.qty != null && input.qty !== batch.qty) changes.push(`quantity ${batch.qty} → ${input.qty}`);
  if (input.unit && input.unit !== batch.qtyUnit) changes.push(`unit ${batch.qtyUnit} → ${input.unit}`);
  if (input.phase && input.phase !== batch.phase) changes.push(`stage ${batch.phase} → ${input.phase}`);
  if (input.location !== undefined && input.location !== batch.location) changes.push(`location ${batch.location ?? "none"} → ${input.location ?? "none"}`);
  if (!changes.length) return state;
  const next = updateBatch(state, batchId, (current) => ({
    ...current,
    species: input.species || current.species,
    qty: input.qty ?? current.qty,
    qtyUnit: input.unit || current.qtyUnit,
    phase: input.phase || current.phase,
    location: input.location === undefined ? current.location : input.location,
    history: [...current.history, { event: "Batch corrected", sub: changes.join(" · "), date: todayStr() }],
  }));
  return logActivity(next, `${batchId} corrected`, changes.join(" · "));
}

export function addDriedStock(state: AppState, species: string, grams: number): AppState {
  const next: AppState = { ...state, inventory: { ...state.inventory, [species]: (state.inventory[species] || 0) + grams }, lifetimeInventory: { ...state.lifetimeInventory, [species]: (state.lifetimeInventory[species] || 0) + grams } };
  return logActivity(next, `${species} dried stock added`, `${grams} g`);
}

export function advanceToBreak(state: AppState, batchId: string): AppState {
  const b = state.batches.find((x) => x.id === batchId); if (!b) return state;
  const next = updateBatch(state, batchId, (batch) => ({ ...batch, phase: "break", history: [...batch.history, { event: "Break & shake", sub: `${batch.qty} ${batch.qtyUnit} mixed`, date: todayStr() }] }));
  return logActivity(next, `${b.id} break & shake`, `${b.qty} ${b.qtyUnit} mixed`);
}

export function spawnToBulk(state: AppState, batchId: string, qty: number, unit: string): AppState {
  const b = state.batches.find((x) => x.id === batchId); if (!b) return state;
  const next = updateBatch(state, batchId, (batch) => ({ ...batch, phase: "bulk", qty: qty || batch.qty, qtyUnit: unit, history: [...batch.history, { event: "Spawned to bulk", sub: `${qty} ${unit}`, date: todayStr() }] }));
  return logActivity(next, `${b.id} spawned to bulk`, `${qty} ${unit}`);
}

export function moveToFruiting(state: AppState, batchId: string, slotId: string): AppState {
  const b = state.batches.find((x) => x.id === batchId); if (!b || occupantOf(state, slotId)) return state;
  const next = updateBatch(state, batchId, (batch) => ({ ...batch, phase: "fruiting", location: slotId, history: [...batch.history, { event: "Moved to fruiting", sub: slotLabel(slotId), date: todayStr() }] }));
  return logActivity(next, `${b.id} moved to fruiting`, slotLabel(slotId));
}

export function moveLocation(state: AppState, batchId: string, slotId: string): AppState {
  const b = state.batches.find((x) => x.id === batchId); if (!b || occupantOf(state, slotId)) return state;
  const next = updateBatch(state, batchId, (batch) => ({ ...batch, location: slotId, history: [...batch.history, { event: "Location updated", sub: slotLabel(slotId), date: todayStr() }] }));
  return logActivity(next, `${b.id} moved`, slotLabel(slotId));
}

export function harvestFlush(state: AppState, batchId: string, freshWeight: number): AppState {
  const b = state.batches.find((x) => x.id === batchId); if (!b) return state;
  const n = b.flushes.length + 1;
  const next = updateBatch(state, batchId, (batch) => ({ ...batch, phase: "drying", flushes: [...batch.flushes, { n, freshWeight, dryWeight: null, harvestDate: todayStr(), driedDate: null }], history: [...batch.history, { event: `Flush ${n} harvested`, sub: `${freshWeight} g fresh · drying`, date: todayStr() }] }));
  return logActivity(next, `${b.id} Flush ${n} harvested`, `${freshWeight} g fresh · drying started`);
}

export function logDryWeight(state: AppState, batchId: string, dryWeight: number): AppState {
  const b = state.batches.find((x) => x.id === batchId); if (!b) return state;
  const flush = b.flushes[b.flushes.length - 1]; if (!flush) return state;
  const next = updateBatch(state, batchId, (batch) => ({ ...batch, phase: "fruiting", flushes: batch.flushes.map((f, i) => i === batch.flushes.length - 1 ? { ...f, dryWeight, driedDate: todayStr() } : f), history: [...batch.history, { event: `Flush ${flush.n} dried`, sub: `${dryWeight} g added to inventory`, date: todayStr() }] }));
  const withInventory: AppState = { ...next, inventory: { ...next.inventory, [b.species]: (next.inventory[b.species] || 0) + dryWeight }, lifetimeInventory: { ...next.lifetimeInventory, [b.species]: (next.lifetimeInventory[b.species] || 0) + dryWeight } };
  return logActivity(withInventory, `${b.id} Flush ${flush.n} dried`, `${dryWeight} g added to inventory`);
}

export function retireBatch(state: AppState, batchId: string): AppState {
  const b = state.batches.find((x) => x.id === batchId); if (!b) return state;
  const next = updateBatch(state, batchId, (batch) => ({ ...batch, phase: "done", location: null, history: [...batch.history, { event: "Batch retired", sub: "Removed from active rotation", date: todayStr() }] }));
  return logActivity(next, `${b.id} retired`);
}
