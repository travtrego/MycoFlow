"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import * as actions from "@/lib/actions";
import { loadState, saveState, seedState } from "@/lib/storage";
import type { SheetConfig } from "@/lib/sheet-types";
import type { AppState, BatchPhase, CultureType, StorageLocation } from "@/lib/types";

interface AppContextValue {
  state: AppState;
  ready: boolean;
  toastMsg: string | null;
  toast: (msg: string) => void;
  sheet: SheetConfig | null;
  openSheet: (config: SheetConfig) => void;
  closeSheet: () => void;
  addCulture: (input: { species: string; type: CultureType; storage: StorageLocation; qty: number }) => string;
  toggleCultureStorage: (id: string) => void;
  discardCulture: (id: string) => void;
  inoculateToGrain: (cultureId: string, qty: number, unit: string) => string | null;
  addBatchAtStage: (input: {
    species: string;
    qty: number;
    unit: string;
    phase: Exclude<BatchPhase, "done">;
    location?: string | null;
    freshWeight?: number;
  }) => { id: string } | { error: string };
  addDriedStock: (species: string, grams: number) => void;
  advanceToBreak: (batchId: string) => void;
  spawnToBulk: (batchId: string, qty: number, unit: string) => void;
  moveToFruiting: (batchId: string, slotId: string) => void;
  moveLocation: (batchId: string, slotId: string) => void;
  harvestFlush: (batchId: string, freshWeight: number) => void;
  logDryWeight: (batchId: string, dryWeight: number) => void;
  retireBatch: (batchId: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(seedState);
  const [ready, setReady] = useState(false);
  const [sheet, setSheet] = useState<SheetConfig | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setState(loadState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveState(state);
  }, [state, ready]);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2200);
  }, []);

  const openSheet = useCallback((config: SheetConfig) => setSheet(config), []);
  const closeSheet = useCallback(() => setSheet(null), []);

  const value: AppContextValue = {
    state,
    ready,
    toastMsg,
    toast,
    sheet,
    openSheet,
    closeSheet,
    addCulture: (input) => {
      const result = actions.addCulture(state, input);
      setState(result.state);
      return result.id;
    },
    toggleCultureStorage: (id) => setState((s) => actions.toggleCultureStorage(s, id)),
    discardCulture: (id) => setState((s) => actions.discardCulture(s, id)),
    inoculateToGrain: (cultureId, qty, unit) => {
      const result = actions.inoculateToGrain(state, cultureId, qty, unit);
      if (!result) return null;
      setState(result.state);
      return result.id;
    },
    addBatchAtStage: (input) => {
      const result = actions.addBatchAtStage(state, input);
      if ("error" in result) return { error: result.error };
      setState(result.state);
      return { id: result.id };
    },
    addDriedStock: (species, grams) => setState((s) => actions.addDriedStock(s, species, grams)),
    advanceToBreak: (batchId) => setState((s) => actions.advanceToBreak(s, batchId)),
    spawnToBulk: (batchId, qty, unit) => setState((s) => actions.spawnToBulk(s, batchId, qty, unit)),
    moveToFruiting: (batchId, slotId) => setState((s) => actions.moveToFruiting(s, batchId, slotId)),
    moveLocation: (batchId, slotId) => setState((s) => actions.moveLocation(s, batchId, slotId)),
    harvestFlush: (batchId, freshWeight) => setState((s) => actions.harvestFlush(s, batchId, freshWeight)),
    logDryWeight: (batchId, dryWeight) => setState((s) => actions.logDryWeight(s, batchId, dryWeight)),
    retireBatch: (batchId) => setState((s) => actions.retireBatch(s, batchId)),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
