import { STORAGE_KEY } from "./constants";
import type { AppState } from "./types";

export function seedState(): AppState {
  return { counters: {}, cultures: [], batches: [], inventory: {}, lifetimeInventory: {}, activity: [] };
}

export function loadState(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppState;
  } catch {
    // storage unavailable or corrupt — fall through to a fresh state
  }
  return seedState();
}

export function saveState(state: AppState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable (private browsing, quota) — data stays in memory for this session
  }
}
