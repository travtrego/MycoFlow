-- MycoFlow schema — run this in the Neon SQL Editor.
-- Mirrors DATA_MODEL.md: cultures, batches (+ flushes, history), activity, inventory.
-- Safe to re-run: drops everything from a previous run first.
--
-- Date/text fields store the app's own pre-formatted strings (e.g. "Jul 22")
-- verbatim rather than real SQL dates — the app is the source of truth for
-- formatting, this is just a durable JSON-shaped store behind it.

drop table if exists batch_history cascade;
drop table if exists flushes cascade;
drop table if exists activity cascade;
drop table if exists inventory cascade;
drop table if exists lifetime_inventory cascade;
drop table if exists id_counters cascade;
drop table if exists batches cascade;
drop table if exists cultures cascade;

create table cultures (
  id      text primary key,
  seq     bigserial,
  species text not null,
  type    text not null check (type in ('agar','lc')),
  storage text not null check (storage in ('room','fridge')),
  qty     integer not null default 1,
  date    text not null
);

create table batches (
  id       text primary key,
  seq      bigserial,
  species  text not null,
  phase    text not null check (phase in ('grain','break','bulk','fruiting','drying','done')),
  qty      integer not null default 1,
  qty_unit text not null,
  location text
);

create table flushes (
  batch_id     text not null references batches(id) on delete cascade,
  n            integer not null,
  fresh_weight integer not null,
  dry_weight   integer,
  harvest_date text not null,
  dried_date   text,
  primary key (batch_id, n)
);

create table batch_history (
  id       bigserial primary key,
  batch_id text not null references batches(id) on delete cascade,
  event    text not null,
  sub      text,
  date     text not null
);

create table activity (
  id   bigserial primary key,
  text text not null,
  sub  text,
  date text not null
);

create table inventory (
  species text primary key,
  grams   integer not null default 0
);

create table lifetime_inventory (
  species text primary key,
  grams   integer not null default 0
);

-- backs nextId()'s per-prefix-per-species counters (e.g. "G-Golden Teacher" -> 3)
create table id_counters (
  key   text primary key,
  value integer not null default 0
);

create index batch_history_batch_id_idx on batch_history(batch_id);
create index flushes_batch_id_idx on flushes(batch_id);
