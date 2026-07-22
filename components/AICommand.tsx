"use client";

import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import type { BatchPhase, CultureType, StorageLocation } from "@/lib/types";

type Action = {
  action:
    | "add_culture"
    | "add_batch"
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

export function AICommand() {
  const app = useApp();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  function executeAction(action: Action): string {
    switch (action.action) {
      case "add_culture": {
        if (!action.species || !action.cultureType || !action.storage || !action.quantity) {
          throw new Error("The culture update is missing required details");
        }
        const id = app.addCulture({
          species: action.species,
          type: action.cultureType,
          storage: action.storage,
          qty: action.quantity,
        });
        return `${id} added`;
      }
      case "add_batch": {
        if (!action.species || !action.quantity || !action.unit || !action.phase) {
          throw new Error("The batch update is missing required details");
        }
        const created = app.addBatchAtStage({
          species: action.species,
          qty: action.quantity,
          unit: action.unit,
          phase: action.phase,
          location: action.location,
          freshWeight: action.phase === "drying" ? action.grams ?? undefined : undefined,
        });
        if ("error" in created) throw new Error(created.error);
        return `${created.id} added`;
      }
      case "advance_break":
        if (!action.batchId) throw new Error("No batch was identified");
        app.advanceToBreak(action.batchId);
        return `${action.batchId} updated`;
      case "spawn_bulk":
        if (!action.batchId || !action.quantity || !action.unit) throw new Error("The bulk update is missing required details");
        app.spawnToBulk(action.batchId, action.quantity, action.unit);
        return `${action.batchId} spawned to bulk`;
      case "move_fruiting":
        if (!action.batchId || !action.location) throw new Error("The fruiting update is missing a batch or location");
        app.moveToFruiting(action.batchId, action.location);
        return `${action.batchId} moved to fruiting`;
      case "move_location":
        if (!action.batchId || !action.location) throw new Error("The location update is missing a batch or location");
        app.moveLocation(action.batchId, action.location);
        return `${action.batchId} moved`;
      case "harvest":
        if (!action.batchId || !action.grams) throw new Error("The harvest update is missing a batch or weight");
        app.harvestFlush(action.batchId, action.grams);
        return `${action.batchId} harvest logged`;
      case "dry_weight":
        if (!action.batchId || !action.grams) throw new Error("The dry-weight update is missing a batch or weight");
        app.logDryWeight(action.batchId, action.grams);
        return `${action.grams} g dried logged`;
      case "add_dried_stock":
        if (!action.species || !action.grams) throw new Error("The inventory update is missing a species or weight");
        app.addDriedStock(action.species, action.grams);
        return `${action.grams} g added to ${action.species} inventory`;
      case "retire_batch":
        if (!action.batchId) throw new Error("No batch was identified");
        app.retireBatch(action.batchId);
        return `${action.batchId} retired`;
    }
  }

  async function submitUpdate() {
    const trimmed = message.trim();
    if (!trimmed || busy) return;

    setBusy(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/ai-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, state: app.state }),
      });
      const data = (await response.json()) as CommandResult;
      if (!response.ok) throw new Error(data.error || "The update could not be processed");
      if (data.needsClarification) throw new Error(data.clarification || "More detail is required");
      if (!data.actions?.length) throw new Error("No database action was produced");

      const completed = data.actions.map(executeAction);
      const summary = completed.join(" · ");
      setMessage("");
      setResult(summary);
      app.toast(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The update could not be processed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ai-command">
      <div className="ai-command-head">
        <div>
          <span>Quick log</span>
          <b>Record what happened</b>
        </div>
      </div>

      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void submitUpdate();
          }
        }}
        placeholder='Example: “Inoculated four quart jars of PE today.”'
        rows={3}
      />

      <button className="ai-submit" type="button" onClick={() => void submitUpdate()} disabled={busy || !message.trim()}>
        {busy ? "Recording…" : "Record update"}
      </button>

      {error ? <div className="ai-error">{error}</div> : null}
      {result ? <div className="ai-proposal"><strong>{result}</strong></div> : null}
    </div>
  );
}
