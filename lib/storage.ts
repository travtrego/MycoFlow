import type { AppState } from "./types";

export function seedState(): AppState {
  return { counters: {}, cultures: [], batches: [], inventory: {}, lifetimeInventory: {}, activity: [] };
}
