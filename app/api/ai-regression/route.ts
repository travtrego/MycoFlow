import { NextResponse } from "next/server";
import { parseMycoCommand } from "@/app/api/ai-command/route";
import type { AppState } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

type ExpectedAction = {
  action: string;
  batchId?: string;
  species?: string;
  quantity?: number;
  grams?: number;
  phase?: string;
  cultureType?: string;
  storage?: string;
  location?: string;
};

type RegressionCase = {
  id: number;
  category: string;
  prompt: string;
  expected: ExpectedAction[];
};

const species = ["PE", "B+", "GT", "Lion's Mane", "Reishi", "Shiitake", "King Oyster", "Maitake"];
const batchIds = ["PE-001", "BPLUS-002", "GT-003", "LM-004", "REISHI-005", "SHIITAKE-006", "KO-007", "MAITAKE-008"];
const locations = ["Martha", "Shelf A", "Shelf B", "Incubator", "Fruiting Room"];

const fixtureState: AppState = {
  counters: {},
  cultures: [
    { id: "CUL-001", species: "PE", type: "agar", storage: "fridge", qty: 3, date: "2026-07-20" },
    { id: "CUL-002", species: "Lion's Mane", type: "lc", storage: "room", qty: 2, date: "2026-07-21" },
  ],
  batches: batchIds.map((id, index) => ({
    id,
    species: species[index],
    phase: index < 2 ? "grain" : index < 4 ? "break" : index < 6 ? "bulk" : "fruiting",
    qty: index + 1,
    qtyUnit: index < 4 ? "quart jars" : "tubs",
    location: locations[index % locations.length],
    flushes: index >= 6 ? [{ n: 1, freshWeight: 400 + index * 10, dryWeight: null, harvestDate: "2026-07-22", driedDate: null }] : [],
    history: [],
  })),
  inventory: { PE: 42, GT: 28, "Lion's Mane": 35 },
  lifetimeInventory: { PE: 120, GT: 75, "Lion's Mane": 90 },
  activity: [],
};

function buildCases(): RegressionCase[] {
  const cases: RegressionCase[] = [];
  let id = 1;
  const add = (category: string, prompt: string, expected: ExpectedAction[]) => cases.push({ id: id++, category, prompt, expected });

  const batchTemplates = [
    (s: string, q: number) => `Inoculated ${q} quart jars of ${s} today.`,
    (s: string, q: number) => `Knocked up ${q} jars with ${s}.`,
    (s: string, q: number) => `Started ${q} grain jars, strain ${s}.`,
    (s: string, q: number) => `${s}: ${q} qrt jars inoculated`,
    (s: string, q: number) => `put ${s} to grain in ${q} jars`,
  ];
  for (let i = 0; i < 100; i++) {
    const s = species[i % species.length];
    const q = (i % 7) + 1;
    add("add_batch", batchTemplates[i % batchTemplates.length](s, q), [{ action: "add_batch", species: s, quantity: q, phase: "grain" }]);
  }

  const cultureTemplates = [
    (s: string, q: number, t: "agar" | "lc", store: "fridge" | "room") => `Added ${q} ${s} ${t === "lc" ? "liquid culture jars" : "agar plates"} to the ${store}.`,
    (s: string, q: number, t: "agar" | "lc", store: "fridge" | "room") => `${q} ${s} ${t} cultures, stored ${store === "fridge" ? "in fridge" : "at room temp"}.`,
    (s: string, q: number, t: "agar" | "lc", store: "fridge" | "room") => `made ${q} new ${s} ${t === "lc" ? "LCs" : "plates"}; ${store}`,
  ];
  for (let i = 0; i < 60; i++) {
    const s = species[i % species.length];
    const q = (i % 5) + 1;
    const cultureType = i % 2 === 0 ? "agar" : "lc";
    const storage = i % 3 === 0 ? "fridge" : "room";
    add("add_culture", cultureTemplates[i % cultureTemplates.length](s, q, cultureType, storage), [{ action: "add_culture", species: s, quantity: q, cultureType, storage }]);
  }

  const breakTemplates = [
    (id: string) => `Break and shake ${id}.`,
    (id: string) => `B&S done on batch ${id}`,
    (id: string) => `shook up ${id} today`,
    (id: string) => `${id} got its break n shake`,
  ];
  for (let i = 0; i < 40; i++) {
    const target = batchIds[i % 2];
    add("advance_break", breakTemplates[i % breakTemplates.length](target), [{ action: "advance_break", batchId: target }]);
  }

  const bulkTemplates = [
    (id: string, q: number) => `Spawned ${id} into ${q} tubs.`,
    (id: string, q: number) => `${id} went to bulk, ${q} monotubs`,
    (id: string, q: number) => `S2B ${id} into ${q} shoeboxes`,
    (id: string, q: number) => `mixed batch ${id} with substrate and made ${q} tubs`,
    (id: string, q: number) => `spawned-to-bulk ${id}; qty ${q}`,
  ];
  for (let i = 0; i < 50; i++) {
    const target = batchIds[2 + (i % 2)];
    const q = (i % 4) + 1;
    add("spawn_bulk", bulkTemplates[i % bulkTemplates.length](target, q), [{ action: "spawn_bulk", batchId: target, quantity: q, phase: "bulk" }]);
  }

  const fruitTemplates = [
    (id: string) => `Moved ${id} to fruiting conditions.`,
    (id: string) => `${id} is fruiting now`,
    (id: string) => `put batch ${id} into FC`,
    (id: string) => `introduced fruiting for ${id}`,
  ];
  for (let i = 0; i < 40; i++) {
    const target = batchIds[4 + (i % 2)];
    add("move_fruiting", fruitTemplates[i % fruitTemplates.length](target), [{ action: "move_fruiting", batchId: target, phase: "fruiting" }]);
  }

  const moveTemplates = [
    (id: string, loc: string) => `Moved ${id} to ${loc}.`,
    (id: string, loc: string) => `${id} is now in the ${loc}`,
    (id: string, loc: string) => `relocated batch ${id} -> ${loc}`,
    (id: string, loc: string) => `put ${id} on ${loc}`,
  ];
  for (let i = 0; i < 40; i++) {
    const target = batchIds[i % batchIds.length];
    const location = locations[(i + 1) % locations.length];
    add("move_location", moveTemplates[i % moveTemplates.length](target, location), [{ action: "move_location", batchId: target, location }]);
  }

  const harvestTemplates = [
    (id: string, g: number) => `Harvested ${g} g fresh from ${id}.`,
    (id: string, g: number) => `${id} flush harvested at ${g} grams wet`,
    (id: string, g: number) => `pulled ${g}g fresh off batch ${id}`,
    (id: string, g: number) => `first flush ${id}: ${g} grams`,
    (id: string, g: number) => `${id} produced ${g}g fresh today`,
  ];
  for (let i = 0; i < 50; i++) {
    const target = batchIds[6 + (i % 2)];
    const grams = 200 + i * 7;
    add("harvest", harvestTemplates[i % harvestTemplates.length](target, grams), [{ action: "harvest", batchId: target, grams }]);
  }

  const dryTemplates = [
    (id: string, fresh: number, dry: number) => `Harvested ${fresh} g fresh from ${id}, dried to ${dry} g.`,
    (id: string, fresh: number, dry: number) => `${id}: ${fresh}g wet and ${dry}g cracker dry`,
    (id: string, fresh: number, dry: number) => `flush from ${id} weighed ${fresh} grams fresh; final dry weight ${dry}`,
    (id: string, fresh: number, dry: number) => `pulled ${fresh}g off ${id}, ended up ${dry}g dry`,
    (id: string, fresh: number, dry: number) => `${id} harvest ${fresh} fresh / ${dry} dry`,
  ];
  for (let i = 0; i < 50; i++) {
    const target = batchIds[6 + (i % 2)];
    const fresh = 300 + i * 9;
    const dry = Math.round(fresh * 0.1);
    add("harvest_and_dry", dryTemplates[i % dryTemplates.length](target, fresh, dry), [
      { action: "harvest", batchId: target, grams: fresh },
      { action: "dry_weight", batchId: target, grams: dry },
    ]);
  }

  const stockTemplates = [
    (s: string, g: number) => `Add ${g} g dried ${s} to inventory.`,
    (s: string, g: number) => `I have ${g} grams of dried ${s} stock`,
    (s: string, g: number) => `${s} dry inventory +${g}g`,
  ];
  for (let i = 0; i < 30; i++) {
    const s = species[i % species.length];
    const grams = 10 + i * 3;
    add("add_dried_stock", stockTemplates[i % stockTemplates.length](s, grams), [{ action: "add_dried_stock", species: s, grams }]);
  }

  const retireTemplates = [
    (id: string) => `Discarded ${id} due to trich.`,
    (id: string) => `${id} contaminated, toss it`,
    (id: string) => `retire batch ${id}`,
    (id: string) => `${id} is done and has been discarded`,
  ];
  for (let i = 0; i < 40; i++) {
    const target = batchIds[i % batchIds.length];
    add("retire_batch", retireTemplates[i % retireTemplates.length](target), [{ action: "retire_batch", batchId: target }]);
  }

  if (cases.length !== 500) throw new Error(`Expected 500 cases, built ${cases.length}`);
  return cases;
}

function sameValue(actual: unknown, expected: unknown) {
  if (typeof actual === "string" && typeof expected === "string") {
    return actual.trim().toLowerCase() === expected.trim().toLowerCase();
  }
  return actual === expected;
}

function validate(result: Awaited<ReturnType<typeof parseMycoCommand>>, expected: ExpectedAction[]) {
  const errors: string[] = [];
  if (result.needsClarification) errors.push(`unexpected clarification: ${result.clarification ?? "none"}`);
  if (result.actions.length !== expected.length) errors.push(`expected ${expected.length} actions, got ${result.actions.length}`);

  expected.forEach((wanted, index) => {
    const actual = result.actions[index];
    if (!actual) return;
    for (const [key, value] of Object.entries(wanted)) {
      const actualValue = actual[key as keyof typeof actual];
      if (!sameValue(actualValue, value)) errors.push(`action ${index + 1} ${key}: expected ${String(value)}, got ${String(actualValue)}`);
    }
  });
  return errors;
}

async function runWithConcurrency<T, R>(items: T[], concurrency: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  async function consume() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await worker(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, consume));
  return results;
}

export async function GET(request: Request) {
  if (process.env.VERCEL_ENV === "production") {
    return NextResponse.json({ error: "Regression runner is disabled in production" }, { status: 403 });
  }

  const url = new URL(request.url);
  const start = Math.max(0, Number(url.searchParams.get("start") ?? 0));
  const count = Math.min(25, Math.max(1, Number(url.searchParams.get("count") ?? 10)));
  const selected = buildCases().slice(start, start + count);

  const outcomes = await runWithConcurrency(selected, 5, async (test) => {
    try {
      const result = await parseMycoCommand(test.prompt, fixtureState);
      const errors = validate(result, test.expected);
      return { id: test.id, category: test.category, prompt: test.prompt, passed: errors.length === 0, errors, result };
    } catch (error) {
      return {
        id: test.id,
        category: test.category,
        prompt: test.prompt,
        passed: false,
        errors: [error instanceof Error ? error.message : "Unknown parser error"],
        result: null,
      };
    }
  });

  const failures = outcomes.filter((outcome) => !outcome.passed);
  return NextResponse.json({
    totalSuiteSize: 500,
    start,
    count: selected.length,
    passed: outcomes.length - failures.length,
    failed: failures.length,
    failures,
  });
}
