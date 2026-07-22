# MycoFlow Data Model & State Machine

Framework-agnostic reference for porting the prototype into a real app (React, backend + DB, whatever). The logic below has no DOM dependencies — it's the part worth keeping as-is.

## Entities

### Culture
```ts
{
  id: string,            // e.g. "GT-AGAR-002"
  species: string,
  type: "agar" | "lc",
  storage: "room" | "fridge",
  qty: number,
  date: string            // date added
}
```

### Batch
```ts
{
  id: string,             // e.g. "GT-002"
  species: string,
  phase: "grain" | "break" | "bulk" | "fruiting" | "drying" | "done",
  qty: number,
  qtyUnit: string,         // "jars" | "bags" | "tubs" | "bins" | "trays" | "shoebox" | "block"
  location: string | null, // slot id, only set once in bulk/fruiting/drying
  flushes: Flush[],
  history: HistoryEvent[]
}
```

### Flush
```ts
{
  n: number,
  freshWeight: number,     // grams
  dryWeight: number | null,// null while drying
  harvestDate: string,
  driedDate: string | null
}
```

### Location slot (fixed, not user-created)
```ts
{ id: string, label: string, group: string }
```
Example groups: "Martha tent" (shelves 1–4), "Outside Martha", "80-qt chambers" (chamber 1–2).
Occupancy is *derived*, not stored on the slot — see `occupantOf()` below. This is the important bit: **never duplicate the relationship in both directions**, always compute it from `batch.location`.

### Inventory
Just a map: `{ [species]: gramsOnHand }`, plus a parallel `lifetimeInventory` map that only ever increases (for "all-time harvested" reporting). Both are mutated only in one place: when a dry weight is logged.

### Activity entry
```ts
{ text: string, sub: string, date: string }
```
Written automatically by every mutating action — never entered manually. Keep it that way; it's the audit trail.

## Phase state machine

```
grain --[break & shake]--> break --[spawn to bulk]--> bulk --[move to fruiting, assign slot]--> fruiting
                                                                                                     |
                                                                                          [harvest flush] 
                                                                                                     v
                                                                                                  drying
                                                                                                     |
                                                                                          [log dry weight]
                                                                                                     v
                                                                                       fruiting (next flush) 
                                                                                             or [retire] --> done
```

Rules that matter:
- A batch can only be in exactly one phase at a time.
- `location` is only assigned starting at `bulk` (or `fruiting` if you skip a bulk step) and cleared on `retire`.
- `drying` is really "fruiting, but this flush isn't dried yet" — don't model it as a separate lifecycle branch, or you'll fight yourself when a batch throws flush after flush.
- Every transition pushes one entry to `batch.history` **and** one to the global `activity` log, in the same action. Don't let these drift apart — one call site, two writes.

## Derived values (compute, don't store)

- `occupantOf(state, slotId)` → find the one non-done batch with `location === slotId`
- `emptySlots(state)` → all slots with no occupant
- `pipelineCounts(state)` → sums of `qty` grouped by phase, for the dashboard stage strip
- `phaseDisplay(batch)` → the pill/label text (e.g. "Recovering after Flush 2") — purely a function of `phase` + `flushes.length`, never stored

## Core transition functions (pure-ish, state in / state out)

```js
function advanceToBreak(state, batchId) {
  const b = state.batches.find(x => x.id === batchId);
  b.phase = 'break';
  b.history.push({ event: 'Break & shake', sub: `${b.qty} ${b.qtyUnit} mixed`, date: today() });
  logActivity(state, `${b.id} break & shake`, `${b.qty} ${b.qtyUnit} mixed`);
}

function spawnToBulk(state, batchId, qty, unit) {
  const b = state.batches.find(x => x.id === batchId);
  b.phase = 'bulk'; b.qty = qty; b.qtyUnit = unit;
  b.history.push({ event: 'Spawned to bulk', sub: `${qty} ${unit}`, date: today() });
  logActivity(state, `${b.id} spawned to bulk`, `${qty} ${unit}`);
}

function moveToFruiting(state, batchId, slotId) {
  const b = state.batches.find(x => x.id === batchId);
  if (occupantOf(state, slotId)) throw new Error('Slot occupied');
  b.phase = 'fruiting'; b.location = slotId;
  b.history.push({ event: 'Moved to fruiting', sub: slotLabel(slotId), date: today() });
  logActivity(state, `${b.id} moved to fruiting`, slotLabel(slotId));
}

function harvestFlush(state, batchId, freshWeight) {
  const b = state.batches.find(x => x.id === batchId);
  const n = b.flushes.length + 1;
  b.flushes.push({ n, freshWeight, dryWeight: null, harvestDate: today(), driedDate: null });
  b.phase = 'drying';
  b.history.push({ event: `Flush ${n} harvested`, sub: `${freshWeight} g fresh · drying`, date: today() });
  logActivity(state, `${b.id} Flush ${n} harvested`, `${freshWeight} g fresh · drying started`);
}

function logDryWeight(state, batchId, dryWeight) {
  const b = state.batches.find(x => x.id === batchId);
  const flush = b.flushes[b.flushes.length - 1];
  flush.dryWeight = dryWeight; flush.driedDate = today();
  b.phase = 'fruiting'; // back to fruiting, "recovering" per phaseDisplay()
  state.inventory[b.species] = (state.inventory[b.species] || 0) + dryWeight;
  state.lifetimeInventory[b.species] = (state.lifetimeInventory[b.species] || 0) + dryWeight;
  b.history.push({ event: `Flush ${flush.n} dried`, sub: `${dryWeight} g added to inventory`, date: today() });
  logActivity(state, `${b.id} Flush ${flush.n} dried`, `${dryWeight} g added to inventory`);
}

function retireBatch(state, batchId) {
  const b = state.batches.find(x => x.id === batchId);
  b.phase = 'done'; b.location = null;
  b.history.push({ event: 'Batch retired', sub: 'Removed from active rotation', date: today() });
  logActivity(state, `${b.id} retired`, '');
}
```

## Porting notes

- **Backend**: this maps cleanly onto two tables (`cultures`, `batches`) plus a `flushes` child table (FK to batch) and an `activity` table. `history` can either be its own table or just a JSON column on `batch` if you don't need to query it separately.
- **IDs**: `nextId()` used a per-species-per-prefix counter stored in state. In a DB, just use a sequence or `COUNT(*)+1` scoped to species+prefix, or switch to UUIDs and keep the human-readable code as a separate display field.
- **Concurrency**: none of this handles two people editing at once. If it's just you, don't bother. If your partner will also log grows, you'll want optimistic locking or last-write-wins with a timestamp, at minimum.
- **Location as source of truth**: keep `location` only on the batch, never mirror it onto the slot. Every UI that needs "what's in shelf 3" should call `occupantOf()`, not read a stored slot->batch map.
