"use client";

import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import type { BatchPhase, CultureType, StorageLocation } from "@/lib/types";

type Proposal = {
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
    | "retire_batch"
    | "unknown";
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
  needsClarification: boolean;
  clarification: string | null;
};

export function AICommand() {
  const app = useApp();
  const [message, setMessage] = useState("");
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function interpret() {
    const trimmed = message.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setError(null);
    setProposal(null);

    try {
      const response = await fetch("/api/ai-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, state: app.state }),
      });
      const data = (await response.json()) as { proposal?: Proposal; error?: string };
      if (!response.ok || !data.proposal) throw new Error(data.error || "Could not interpret that update");
      setProposal(data.proposal);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not interpret that update");
    } finally {
      setBusy(false);
    }
  }

  function applyProposal() {
    if (!proposal || proposal.needsClarification) return;

    switch (proposal.action) {
      case "add_culture": {
        if (!proposal.species || !proposal.cultureType || !proposal.storage || !proposal.quantity) return;
        const id = app.addCulture({
          species: proposal.species,
          type: proposal.cultureType,
          storage: proposal.storage,
          qty: proposal.quantity,
        });
        app.toast(`${id} added`);
        break;
      }
      case "add_batch": {
        if (!proposal.species || !proposal.quantity || !proposal.unit || !proposal.phase) return;
        const result = app.addBatchAtStage({
          species: proposal.species,
          qty: proposal.quantity,
          unit: proposal.unit,
          phase: proposal.phase,
          location: proposal.location,
          freshWeight: proposal.phase === "drying" ? proposal.grams ?? undefined : undefined,
        });
        if ("error" in result) {
          setError(result.error);
          return;
        }
        app.toast(`${result.id} added`);
        break;
      }
      case "advance_break":
        if (!proposal.batchId) return;
        app.advanceToBreak(proposal.batchId);
        app.toast(`${proposal.batchId} updated`);
        break;
      case "spawn_bulk":
        if (!proposal.batchId || !proposal.quantity || !proposal.unit) return;
        app.spawnToBulk(proposal.batchId, proposal.quantity, proposal.unit);
        app.toast(`${proposal.batchId} spawned to bulk`);
        break;
      case "move_fruiting":
        if (!proposal.batchId || !proposal.location) return;
        app.moveToFruiting(proposal.batchId, proposal.location);
        app.toast(`${proposal.batchId} moved to fruiting`);
        break;
      case "move_location":
        if (!proposal.batchId || !proposal.location) return;
        app.moveLocation(proposal.batchId, proposal.location);
        app.toast(`${proposal.batchId} moved`);
        break;
      case "harvest":
        if (!proposal.batchId || !proposal.grams) return;
        app.harvestFlush(proposal.batchId, proposal.grams);
        app.toast(`${proposal.batchId} harvest logged`);
        break;
      case "dry_weight":
        if (!proposal.batchId || !proposal.grams) return;
        app.logDryWeight(proposal.batchId, proposal.grams);
        app.toast(`${proposal.grams} g added to inventory`);
        break;
      case "add_dried_stock":
        if (!proposal.species || !proposal.grams) return;
        app.addDriedStock(proposal.species, proposal.grams);
        app.toast(`${proposal.grams} g added to inventory`);
        break;
      case "retire_batch":
        if (!proposal.batchId) return;
        app.retireBatch(proposal.batchId);
        app.toast(`${proposal.batchId} retired`);
        break;
      default:
        setError("I couldn't turn that into a supported update yet.");
        return;
    }

    setMessage("");
    setProposal(null);
    setError(null);
  }

  return (
    <div className="ai-command">
      <div className="ai-command-head">
        <div>
          <span>AI log entry</span>
          <b>Tell MycoFlow what happened</b>
        </div>
        <div className="ai-spark">✦</div>
      </div>

      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void interpret();
          }
        }}
        placeholder='Try “Harvested 612 g fresh from PE batch 1.”'
        rows={3}
      />

      <button className="ai-submit" type="button" onClick={() => void interpret()} disabled={busy || !message.trim()}>
        {busy ? "Interpreting…" : "Interpret update"}
      </button>

      {error ? <div className="ai-error">{error}</div> : null}

      {proposal ? (
        <div className="ai-proposal">
          <small>{proposal.needsClarification ? "Need one detail" : "Ready to update"}</small>
          <strong>{proposal.needsClarification ? proposal.clarification : proposal.summary}</strong>
          {!proposal.needsClarification ? (
            <div className="ai-actions">
              <button type="button" className="ai-confirm" onClick={applyProposal}>Confirm</button>
              <button type="button" className="ai-cancel" onClick={() => setProposal(null)}>Cancel</button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
