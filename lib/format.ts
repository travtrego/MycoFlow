export function todayStr(): string {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function fmtGrams(n: number): string {
  return `${n} g`;
}

/** Mutates nothing: returns a new counters map plus the freshly minted id. */
export function nextId(
  counters: Record<string, number>,
  prefix: string,
  species: string
): { id: string; counters: Record<string, number> } {
  const key = `${prefix}-${species}`;
  const counter = (counters[key] || 0) + 1;
  const initials = species.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase();
  const id = `${initials}-${prefix}-${String(counter).padStart(3, "0")}`;
  return { id, counters: { ...counters, [key]: counter } };
}
