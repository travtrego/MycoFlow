"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import * as actions from "@/lib/actions";
import { seedState } from "@/lib/storage";
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
  canUndo: boolean;
  undoLastAction: () => boolean;
  addCulture: (input: { species: string; type: CultureType; storage: StorageLocation; qty: number }) => string;
  toggleCultureStorage: (id: string) => void;
  discardCulture: (id: string) => void;
  inoculateToGrain: (cultureId: string, qty: number, unit: string) => string | null;
  addBatchAtStage: (input: { species: string; qty: number; unit: string; phase: Exclude<BatchPhase, "done">; location?: string | null; freshWeight?: number }) => { id: string } | { error: string };
  editBatch: (batchId: string, input: { species?: string | null; qty?: number | null; unit?: string | null; phase?: Exclude<BatchPhase, "done"> | null; location?: string | null }) => void;
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
const serialize = (value: AppState) => JSON.stringify(value);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(seedState);
  const [ready, setReady] = useState(false);
  const [sheet, setSheet] = useState<SheetConfig | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [undoState, setUndoState] = useState<AppState | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastServerState = useRef<string>(serialize(seedState()));
  const saving = useRef(false);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2200);
  }, []);

  const commit = useCallback((updater: (current: AppState) => AppState) => {
    setState((current) => {
      const next = updater(current);
      if (serialize(next) === serialize(current)) return current;
      setUndoState(current);
      return next;
    });
  }, []);

  const loadLatest = useCallback(async (showNotice = false) => {
    const response = await fetch("/api/state", { cache: "no-store" });
    if (!response.ok) throw new Error("load failed");
    const latest = (await response.json()) as AppState;
    const serialized = serialize(latest);
    lastServerState.current = serialized;
    setState((current) => {
      if (serialize(current) === serialized) return current;
      if (showNotice) toast("Dashboard refreshed with newer updates");
      return latest;
    });
  }, [toast]);

  useEffect(() => {
    loadLatest().catch(() => toast("Couldn't load your data — check your connection")).finally(() => setReady(true));
  }, [loadLatest, toast]);

  useEffect(() => {
    if (!ready) return;
    const refresh = () => {
      if (document.visibilityState === "visible" && !saving.current) loadLatest(true).catch(() => undefined);
    };
    const interval = window.setInterval(refresh, 15000);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [ready, loadLatest]);

  useEffect(() => {
    if (!ready) return;
    const nextSerialized = serialize(state);
    if (nextSerialized === lastServerState.current) return;
    let cancelled = false;
    saving.current = true;
    (async () => {
      try {
        const currentResponse = await fetch("/api/state", { cache: "no-store" });
        if (!currentResponse.ok) throw new Error("pre-save check failed");
        const currentServer = (await currentResponse.json()) as AppState;
        const currentSerialized = serialize(currentServer);
        if (currentSerialized !== lastServerState.current) {
          lastServerState.current = currentSerialized;
          if (!cancelled) {
            setState(currentServer);
            setUndoState(null);
            toast("Newer updates were found, so the stale save was blocked");
          }
          return;
        }
        const saveResponse = await fetch("/api/state", { method: "PUT", headers: { "Content-Type": "application/json" }, body: nextSerialized });
        if (!saveResponse.ok) throw new Error("save failed");
        lastServerState.current = nextSerialized;
      } catch {
        if (!cancelled) toast("Couldn't save — check your connection");
      } finally {
        saving.current = false;
      }
    })();
    return () => { cancelled = true; };
  }, [state, ready, toast]);

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
    canUndo: undoState !== null,
    undoLastAction: () => {
      if (!undoState) return false;
      const previous = undoState;
      setUndoState(null);
      setState(previous);
      toast("Last action undone");
      return true;
    },
    addCulture: (input) => {
      let id = "";
      commit((current) => {
        const result = actions.addCulture(current, input);
        id = result.id;
        return result.state;
      });
      return id;
    },
    toggleCultureStorage: (id) => commit((s) => actions.toggleCultureStorage(s, id)),
    discardCulture: (id) => commit((s) => actions.discardCulture(s, id)),
    inoculateToGrain: (cultureId, qty, unit) => {
      let id: string | null = null;
      commit((current) => {
        const result = actions.inoculateToGrain(current, cultureId, qty, unit);
        if (!result) return current;
        id = result.id;
        return result.state;
      });
      return id;
    },
    addBatchAtStage: (input) => {
      let output: { id: string } | { error: string } = { error: "The batch could not be created" };
      commit((current) => {
        const result = actions.addBatchAtStage(current, input);
        if ("error" in result) {
          output = { error: result.error };
          return current;
        }
        output = { id: result.id };
        return result.state;
      });
      return output;
    },
    editBatch: (batchId, input) => commit((s) => actions.editBatch(s, batchId, input)),
    addDriedStock: (species, grams) => commit((s) => actions.addDriedStock(s, species, grams)),
    advanceToBreak: (batchId) => commit((s) => actions.advanceToBreak(s, batchId)),
    spawnToBulk: (batchId, qty, unit) => commit((s) => actions.spawnToBulk(s, batchId, qty, unit)),
    moveToFruiting: (batchId, slotId) => commit((s) => actions.moveToFruiting(s, batchId, slotId)),
    moveLocation: (batchId, slotId) => commit((s) => actions.moveLocation(s, batchId, slotId)),
    harvestFlush: (batchId, freshWeight) => commit((s) => actions.harvestFlush(s, batchId, freshWeight)),
    logDryWeight: (batchId, dryWeight) => commit((s) => actions.logDryWeight(s, batchId, dryWeight)),
    retireBatch: (batchId) => commit((s) => actions.retireBatch(s, batchId)),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
