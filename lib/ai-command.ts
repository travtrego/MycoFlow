import OpenAI from "openai";
import type { AppState } from "@/lib/types";

const actionProperties = {
  action: {
    type: "string",
    enum: ["add_culture", "add_batch", "advance_break", "spawn_bulk", "move_fruiting", "move_location", "harvest", "dry_weight", "add_dried_stock", "retire_batch"],
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
      "You are a command parser for MycoFlow, not a conversational assistant.",
      "Translate the user's cultivation update into concrete database actions and call the function.",
      "Do not chat, coach, greet, explain, or suggest anything.",
      "Use multiple actions when one update contains multiple completed events.",
      "Resolve ordinary references from current data, including 'those jars', 'that batch', species names, stage, and the most recently relevant matching batch.",
      "Only request clarification when executing would risk changing the wrong record. Keep that question under 12 words.",
      "Never invent a batch ID, species, weight, quantity, location, or stage.",
      "'Inoculated four quart jars of PE today.' => add_batch, species PE, quantity 4, unit quart jars, phase grain.",
      "'Spawned PE batch 01 into two 80-quart tubs.' => spawn_bulk on the matching PE batch, quantity 2, unit 80-quart tubs.",
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
