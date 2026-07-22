export type CultureType = "agar" | "lc";
export type StorageLocation = "room" | "fridge";

export interface Culture {
  id: string;
  species: string;
  type: CultureType;
  storage: StorageLocation;
  qty: number;
  date: string;
}

export type BatchPhase = "grain" | "break" | "bulk" | "fruiting" | "drying" | "done";

export interface Flush {
  n: number;
  freshWeight: number;
  dryWeight: number | null;
  harvestDate: string;
  driedDate: string | null;
}

export interface HistoryEvent {
  event: string;
  sub?: string;
  date: string;
}

export interface Batch {
  id: string;
  species: string;
  phase: BatchPhase;
  qty: number;
  qtyUnit: string;
  location: string | null;
  flushes: Flush[];
  history: HistoryEvent[];
}

export interface ActivityEntry {
  text: string;
  sub?: string;
  date: string;
}

export interface LocationSlot {
  id: string;
  label: string;
  group: string;
}

export interface AppState {
  counters: Record<string, number>;
  cultures: Culture[];
  batches: Batch[];
  inventory: Record<string, number>;
  lifetimeInventory: Record<string, number>;
  activity: ActivityEntry[];
}
