import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import type { ActivityEntry, AppState, Batch, Culture, Flush, HistoryEvent } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CultureRow {
  id: string;
  species: string;
  type: Culture["type"];
  storage: Culture["storage"];
  qty: number;
  date: string;
}
interface BatchRow {
  id: string;
  species: string;
  phase: Batch["phase"];
  qty: number;
  qty_unit: string;
  location: string | null;
}
interface FlushRow {
  batch_id: string;
  n: number;
  fresh_weight: number;
  dry_weight: number | null;
  harvest_date: string;
  dried_date: string | null;
}
interface HistoryRow {
  batch_id: string;
  event: string;
  sub: string | null;
  date: string;
}
interface ActivityRow {
  text: string;
  sub: string | null;
  date: string;
}
interface KeyValueRow {
  species?: string;
  key?: string;
  grams?: number;
  value?: number;
}

export async function GET() {
  const sql = getSql();

  const [cultureRows, batchRows, flushRows, historyRows, activityRows, inventoryRows, lifetimeRows, counterRows] =
    await Promise.all([
      sql`select id, species, type, storage, qty, date from cultures order by seq desc` as unknown as Promise<CultureRow[]>,
      sql`select id, species, phase, qty, qty_unit, location from batches order by seq desc` as unknown as Promise<BatchRow[]>,
      sql`select batch_id, n, fresh_weight, dry_weight, harvest_date, dried_date from flushes order by n asc` as unknown as Promise<FlushRow[]>,
      sql`select batch_id, event, sub, date from batch_history order by id asc` as unknown as Promise<HistoryRow[]>,
      sql`select text, sub, date from activity order by id desc` as unknown as Promise<ActivityRow[]>,
      sql`select species, grams from inventory` as unknown as Promise<KeyValueRow[]>,
      sql`select species, grams from lifetime_inventory` as unknown as Promise<KeyValueRow[]>,
      sql`select key, value from id_counters` as unknown as Promise<KeyValueRow[]>,
    ]);

  const flushesByBatch = new Map<string, Flush[]>();
  for (const f of flushRows) {
    const list = flushesByBatch.get(f.batch_id) ?? [];
    list.push({ n: f.n, freshWeight: f.fresh_weight, dryWeight: f.dry_weight, harvestDate: f.harvest_date, driedDate: f.dried_date });
    flushesByBatch.set(f.batch_id, list);
  }
  const historyByBatch = new Map<string, HistoryEvent[]>();
  for (const h of historyRows) {
    const list = historyByBatch.get(h.batch_id) ?? [];
    list.push({ event: h.event, sub: h.sub ?? undefined, date: h.date });
    historyByBatch.set(h.batch_id, list);
  }

  const cultures: Culture[] = cultureRows.map((c) => ({
    id: c.id,
    species: c.species,
    type: c.type,
    storage: c.storage,
    qty: c.qty,
    date: c.date,
  }));

  const batches: Batch[] = batchRows.map((b) => ({
    id: b.id,
    species: b.species,
    phase: b.phase,
    qty: b.qty,
    qtyUnit: b.qty_unit,
    location: b.location,
    flushes: flushesByBatch.get(b.id) ?? [],
    history: historyByBatch.get(b.id) ?? [],
  }));

  const inventory: Record<string, number> = {};
  for (const r of inventoryRows) if (r.species != null && r.grams != null) inventory[r.species] = r.grams;
  const lifetimeInventory: Record<string, number> = {};
  for (const r of lifetimeRows) if (r.species != null && r.grams != null) lifetimeInventory[r.species] = r.grams;
  const counters: Record<string, number> = {};
  for (const r of counterRows) if (r.key != null && r.value != null) counters[r.key] = r.value;

  const activity: ActivityEntry[] = activityRows.map((a) => ({ text: a.text, sub: a.sub ?? undefined, date: a.date }));

  const state: AppState = { counters, cultures, batches, inventory, lifetimeInventory, activity };
  return NextResponse.json(state);
}

export async function PUT(request: Request) {
  const state = (await request.json()) as AppState;
  const sql = getSql();

  await sql`delete from batch_history`;
  await sql`delete from flushes`;
  await sql`delete from activity`;
  await sql`delete from inventory`;
  await sql`delete from lifetime_inventory`;
  await sql`delete from id_counters`;
  await sql`delete from batches`;
  await sql`delete from cultures`;

  // arrays are newest-first (unshift); insert oldest-first so `seq`/id ordering
  // reconstructs the same newest-first order on read
  for (const c of [...state.cultures].reverse()) {
    await sql`insert into cultures (id, species, type, storage, qty, date)
      values (${c.id}, ${c.species}, ${c.type}, ${c.storage}, ${c.qty}, ${c.date})`;
  }
  for (const b of [...state.batches].reverse()) {
    await sql`insert into batches (id, species, phase, qty, qty_unit, location)
      values (${b.id}, ${b.species}, ${b.phase}, ${b.qty}, ${b.qtyUnit}, ${b.location})`;
    for (const f of b.flushes) {
      await sql`insert into flushes (batch_id, n, fresh_weight, dry_weight, harvest_date, dried_date)
        values (${b.id}, ${f.n}, ${f.freshWeight}, ${f.dryWeight}, ${f.harvestDate}, ${f.driedDate})`;
    }
    for (const h of b.history) {
      await sql`insert into batch_history (batch_id, event, sub, date)
        values (${b.id}, ${h.event}, ${h.sub ?? null}, ${h.date})`;
    }
  }
  for (const a of [...state.activity].reverse()) {
    await sql`insert into activity (text, sub, date) values (${a.text}, ${a.sub ?? null}, ${a.date})`;
  }
  for (const [species, grams] of Object.entries(state.inventory)) {
    await sql`insert into inventory (species, grams) values (${species}, ${grams})`;
  }
  for (const [species, grams] of Object.entries(state.lifetimeInventory)) {
    await sql`insert into lifetime_inventory (species, grams) values (${species}, ${grams})`;
  }
  for (const [key, value] of Object.entries(state.counters)) {
    await sql`insert into id_counters (key, value) values (${key}, ${value})`;
  }

  return NextResponse.json({ ok: true });
}
