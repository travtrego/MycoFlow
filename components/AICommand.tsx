"use client";

import { useRef, useState } from "react";
import { useApp } from "@/components/AppProvider";
import type { BatchPhase, CultureType, StorageLocation } from "@/lib/types";

type Action = {
  action:
    | "add_culture"
    | "add_batch"
    | "edit_batch"
    | "advance_break"
    | "spawn_bulk"
    | "move_fruiting"
    | "move_location"
    | "harvest"
    | "dry_weight"
    | "add_dried_stock"
    | "retire_batch";
  summary: string;
  batchId: string | null;
  species: string | null;
  quantity: number | null;
  unit: string | null;
  phase: Exclude<BatchPhase, "done"> | null;
  location: string | null;
  grams: number | null;
  cultureType: CultureType | null;
  storage: StorageLocation | null;
};

type CommandResult = {
  actions?: Action[];
  needsClarification?: boolean;
  clarification?: string | null;
  error?: string;
};

type PendingUpdate = { actions: Action[]; duplicate: boolean };

const IMPORTANT_ACTIONS = new Set<Action["action"]>(["edit_batch", "harvest", "dry_weight", "add_dried_stock", "retire_batch"]);
const dayLabel = () => new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" });

export function AICommand() {
  const app = useApp();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingUpdate | null>(null);
  const lastExecution = useRef<{ signature: string; at: number } | null>(null);

  function getBatch(batchId: string | null) {
    if (!batchId) throw new Error("No batch was identified");
    const batch = app.state.batches.find((item) => item.id.toLowerCase() === batchId.toLowerCase());
    if (!batch) throw new Error(`Batch ${batchId} was not found. Check the ID and try again.`);
    return batch;
  }

  function describeAction(action: Action): string {
    switch (action.action) {
      case "add_culture": return `Add ${action.quantity} ${action.species} ${action.cultureType === "agar" ? "agar plates" : "liquid culture"}`;
      case "add_batch": return `Add ${action.quantity} ${action.species} ${action.phase} ${action.unit}`;
      case "edit_batch": return `Correct ${action.batchId}: ${action.summary}`;
      case "advance_break": return `Mark ${action.batchId} break-and-shake complete`;
      case "spawn_bulk": return `Spawn ${action.batchId} into ${action.quantity} ${action.unit}`;
      case "move_fruiting": return `Move ${action.batchId} to fruiting${action.location ? ` at ${action.location}` : ""}`;
      case "move_location": return `Move ${action.batchId} to ${action.location}`;
      case "harvest": return `Record ${action.grams} g fresh from ${action.batchId}`;
      case "dry_weight": return `Record ${action.grams} g dry for ${action.batchId}`;
      case "add_dried_stock": return `Add ${action.grams} g dried ${action.species} to inventory`;
      case "retire_batch": return `Retire ${action.batchId}`;
    }
  }

  function executeAction(action: Action): string {
    switch (action.action) {
      case "add_culture": {
        if (!action.species || !action.cultureType || !action.storage || !action.quantity) throw new Error("The culture update is missing required details");
        app.addCulture({ species: action.species, type: action.cultureType, storage: action.storage, qty: action.quantity });
        return `Recorded ${action.quantity} ${action.species} ${action.cultureType === "agar" ? "agar plates" : "liquid culture units"} on ${dayLabel()}.`;
      }
      case "add_batch": {
        if (!action.species || !action.quantity || !action.unit || !action.phase) throw new Error("The batch update is missing required details");
        const created = app.addBatchAtStage({ species: action.species, qty: action.quantity, unit: action.unit, phase: action.phase, location: action.location, freshWeight: action.phase === "drying" ? action.grams ?? undefined : undefined });
        if ("error" in created) throw new Error(created.error);
        return `Recorded ${action.quantity} ${action.species} ${action.phase} ${action.unit} on ${dayLabel()}.`;
      }
      case "edit_batch": {
        const batch = getBatch(action.batchId);
        if (!action.species && action.quantity == null && !action.unit && !action.phase && action.location == null) throw new Error("No corrected field was provided");
        app.editBatch(batch.id, { species: action.species, qty: action.quantity, unit: action.unit, phase: action.phase, location: action.location === null ? undefined : action.location });
        return `Corrected ${batch.id} on ${dayLabel()}.`;
      }
      case "advance_break": {
        const batch = getBatch(action.batchId);
        app.advanceToBreak(batch.id);
        return `Recorded break-and-shake for ${batch.id} on ${dayLabel()}.`;
      }
      case "spawn_bulk": {
        const batch = getBatch(action.batchId);
        if (!action.quantity || !action.unit) throw new Error("The bulk update is missing quantity or unit");
        app.spawnToBulk(batch.id, action.quantity, action.unit);
        return `Recorded ${batch.id} spawned into ${action.quantity} ${action.unit} on ${dayLabel()}.`;
      }
      case "move_fruiting": {
        const batch = getBatch(action.batchId);
        const location = action.location || batch.location;
        if (!location) throw new Error(`Choose a fruiting location for ${batch.id}.`);
        app.moveToFruiting(batch.id, location);
        return `Recorded ${batch.id} moved to fruiting at ${location} on ${dayLabel()}.`;
      }
      case "move_location": {
        const batch = getBatch(action.batchId);
        if (!action.location) throw new Error("The location update is missing a location");
        app.moveLocation(batch.id, action.location);
        return `Recorded ${batch.id} moved to ${action.location} on ${dayLabel()}.`;
      }
      case "harvest": {
        const batch = getBatch(action.batchId);
        if (!action.grams) throw new Error("The harvest update is missing a weight");
        app.harvestFlush(batch.id, action.grams);
        return `Recorded ${action.grams} g fresh from ${batch.id} on ${dayLabel()}.`;
      }
      case "dry_weight": {
        const batch = getBatch(action.batchId);
        if (!action.grams) throw new Error("The dry-weight update is missing a weight");
        if (!batch.flushes.length) throw new Error(`${batch.id} has no harvested flush awaiting a dry weight.`);
        app.logDryWeight(batch.id, action.grams);
        return `Recorded ${action.grams} g dry for ${batch.id} on ${dayLabel()}.`;
      }
      case "add_dried_stock": {
        if (!action.species || !action.grams) throw new Error("The inventory update is missing a species or weight");
        app.addDriedStock(action.species, action.grams);
        return `Added ${action.grams} g dried ${action.species} to inventory on ${dayLabel()}.`;
      }
      case "retire_batch": {
        const batch = getBatch(action.batchId);
        app.retireBatch(batch.id);
        return `Retired ${batch.id} on ${dayLabel()}.`;
      }
    }
  }

  function executeActions(actions: Action[]) {
    const completed = actions.map(executeAction);
    const summary = completed.join(" ");
    const signature = JSON.stringify(actions);
    lastExecution.current = { signature, at: Date.now() };
    setMessage("");
    setPending(null);
    setResult(summary);
    app.toast(summary);
  }

  async function submitUpdate() {
    const trimmed = message.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setError(null);
    setResult(null);
    setPending(null);
    try {
      const response = await fetch("/api/ai-command", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: trimmed, state: app.state }) });
      const data = (await response.json()) as CommandResult;
      if (!response.ok) throw new Error(data.error || "The update could not be processed");
      if (data.needsClarification) throw new Error(data.clarification || "More detail is required");
      if (!data.actions?.length) throw new Error("No database action was produced");

      for (const action of data.actions) {
        if (action.batchId && !app.state.batches.some((batch) => batch.id.toLowerCase() === action.batchId!.toLowerCase())) {
          throw new Error(`Batch ${action.batchId} was not found. Check the ID and try again.`);
        }
      }

      const signature = JSON.stringify(data.actions);
      const duplicate = Boolean(lastExecution.current && lastExecution.current.signature === signature && Date.now() - lastExecution.current.at < 120000);
      const important = data.actions.some((action) => IMPORTANT_ACTIONS.has(action.action));
      if (important || duplicate) {
        setPending({ actions: data.actions, duplicate });
      } else {
        executeActions(data.actions);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "The update could not be processed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ai-command">
      <div className="ai-command-head">
        <div><span>Quick log</span><b>Record what happened</b></div>
        {app.canUndo ? <button type="button" className="link" onClick={() => app.undoLastAction()}>Undo last action</button> : null}
      </div>

      <textarea value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void submitUpdate(); } }} placeholder='Example: “Inoculated four quart jars of PE today.”' rows={3} />

      <button className="ai-submit" type="button" onClick={() => void submitUpdate()} disabled={busy || !message.trim()}>{busy ? "Checking…" : "Review update"}</button>

      {error ? <div className="ai-error">{error}</div> : null}
      {pending ? (
        <div className="ai-proposal">
          <strong>{pending.duplicate ? "Possible duplicate — confirm before recording:" : "Confirm this update:"}</strong>
          {pending.actions.map((action, index) => <div key={`${action.action}-${index}`}>{describeAction(action)}</div>)}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button className="ai-submit" type="button" onClick={() => { try { executeActions(pending.actions); } catch (err) { setPending(null); setError(err instanceof Error ? err.message : "The update could not be recorded"); } }}>Confirm</button>
            <button type="button" className="link" onClick={() => setPending(null)}>Cancel</button>
          </div>
        </div>
      ) : null}
      {result ? <div className="ai-proposal"><strong>{result}</strong></div> : null}
    </div>
  );
}
