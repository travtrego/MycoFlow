import OpenAI from "openai";
import type { AppState } from "@/lib/types";

const actionProperties = {
  action: {
    type: "string",
    enum: ["add_culture", "add_batch", "edit_batch", "advance_break", "spawn_bulk", "move_fruiting", "move_location", "harvest", "dry_weight", "add_dried_stock", "retire_batch"],
  },
  summary: { type: "string" },
  batchId: { type: ["string", "null"] },
  species: { type: ["string", "null"] },
  quantity: { type: ["number", "null"] },
  unit: { type: ["string", "null"] },
  phase: { type: ["string", "null"], enum: ["grain", "break", "bulk", "fruiting", "drying", null] },
  location: { type: ["string", "null"] },
  grams: { type: ["number", "null"] },
  cultureType: { type: ["string", "null"], enum: ["agar", "lc", null] },
  storage: { type: ["string", "null"], enum: ["room", "fridge", null] },
};

const actionTool = {
  type: "function" as const,
  name: "execute_mycoflow_update",
  description: "Translate a cultivation log entry into one or more concrete MycoFlow database actions.",
  strict: true,
  parameters: {
    type: "object",
    additionalProperties: false,
    properties: {
      actions: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          additionalProperties: false,
          properties: actionProperties,
          required: ["action", "summary", "batchId", "species", "quantity", "unit", "phase", "location", "grams", "cultureType", "storage"],
        },
      },
      needsClarification: { type: "boolean" },
      clarification: { type: ["string", "null"] },
    },
    required: ["actions", "needsClarification", "clarification"],
  },
};

export type ParsedMycoCommand = {
  actions: Array<{
    action: string;
    summary: string;
    batchId: string | null;
    species: string | null;
    quantity: number | null;
    unit: string | null;
    phase: string | null;
    location: string | null;
    grams: number | null;
    cultureType: string | null;
    storage: string | null;
  }>;
  needsClarification: boolean;
  clarification: string | null;
};

export async function parseMycoCommand(message: string, state: AppState): Promise<ParsedMycoCommand> {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

  const stateSummary = {
    cultures: state.cultures.map((culture) => ({ id: culture.id, species: culture.species, type: culture.type, storage: culture.storage, qty: culture.qty })),
    batches: state.batches.map((batch) => ({ id: batch.id, species: batch.species, phase: batch.phase, qty: batch.qty, unit: batch.qtyUnit, location: batch.location, flushCount: batch.flushes.length, latestFlush: batch.flushes.at(-1) ?? null })),
    inventory: state.inventory,
  };

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5-mini",
    reasoning: { effort: "low" },
    instructions: [
      "You are a deterministic command parser for MycoFlow, not a conversational assistant.",
      "Translate the user's cultivation update into the smallest correct set of database actions and call the function.",
      "Do not chat, coach, greet, explain, or suggest anything.",
      "For a single completed event, return exactly one action. Use multiple actions only when the user explicitly reports multiple distinct completed events, such as a fresh harvest and its dried weight.",
      "Do not ask for clarification about jar size, container size, or unit when the user already says jars, plates, tubs, shoeboxes, bags, or cultures. Preserve the stated generic unit exactly.",
      "The phrases 'inoculated', 'knocked up', 'started grain jars', 'put SPECIES to grain', and 'SPECIES to grain in N jars' always create a new add_batch action in phase grain.",
      "Break and shake phrases always mean advance_break. Spawning or S2B phrases always mean spawn_bulk. Fruiting-condition phrases always mean move_fruiting.",
      "Use move_location only when the user names a physical location such as Martha, shelf, incubator, room, tent, or refrigerator.",
      "When the user says correct, change, edit, fix, actually, or meant, and refers to an existing batch, use edit_batch. Include only the corrected fields plus batchId. Examples: 'Correct PE-001 to 5 jars' => edit_batch with quantity 5 and unit jars. 'Actually GT-003 is B+' => edit_batch with species B+. 'Change KO-007 to bulk' => edit_batch with phase bulk.",
      "Resolve exact batch IDs exactly. When a species and stage identify one sensible current batch, use that batch without clarification.",
      "If an explicitly named batch ID is absent from current data, request clarification and say that batch was not found. Never substitute another batch.",
      "Only request clarification when two or more existing records are genuinely equally plausible and choosing one could update the wrong record.",
      "Never invent a batch ID, species, weight, quantity, location, or stage.",
      "'Inoculated four quart jars of PE today.' => one add_batch action, species PE, quantity 4, unit quart jars, phase grain.",
      "'Knocked up 5 jars with Lion's Mane.' => one add_batch action, species Lion's Mane, quantity 5, unit jars, phase grain.",
      "'Put King Oyster to grain in 1 jar.' => one add_batch action, species King Oyster, quantity 1, unit jar, phase grain, no batchId.",
      "'Break and shake PE-001.' => one advance_break action on PE-001.",
      "'Spawned GT-003 into two tubs.' => one spawn_bulk action on GT-003, quantity 2, unit tubs, phase bulk.",
      "'Moved KO-007 to the Martha.' => one move_location action on KO-007, location Martha.",
      "'Harvested first flush. 612 g fresh, dried to 59 g.' => harvest 612 g and dry_weight 59 g on the same matching batch.",
      "'Discarded PE Batch 003 trich.' => retire_batch on that exact batch.",
      "For fresh harvest weights use harvest. For dried weight tied to a batch use dry_weight. For standalone dried inventory use add_dried_stock.",
    ].join(" "),
    input: `Current MycoFlow data:\n${JSON.stringify(stateSummary)}\n\nCultivation update:\n${message}`,
    tools: [actionTool],
    tool_choice: { type: "function", name: "execute_mycoflow_update" },
  });

  const call = response.output.find((item) => item.type === "function_call");
  if (!call || call.type !== "function_call") throw new Error("No database action was produced");
  return JSON.parse(call.arguments) as ParsedMycoCommand;
}
