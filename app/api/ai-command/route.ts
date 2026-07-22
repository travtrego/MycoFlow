import OpenAI from "openai";
import { NextResponse } from "next/server";
import type { AppState } from "@/lib/types";

export const runtime = "nodejs";

type RequestBody = {
  message?: string;
  state?: AppState;
};

const actionTool = {
  type: "function" as const,
  name: "propose_mycoflow_action",
  description: "Convert one natural-language mushroom cultivation update into exactly one MycoFlow action.",
  strict: true,
  parameters: {
    type: "object",
    additionalProperties: false,
    properties: {
      action: {
        type: "string",
        enum: [
          "add_culture",
          "add_batch",
          "advance_break",
          "spawn_bulk",
          "move_fruiting",
          "move_location",
          "harvest",
          "dry_weight",
          "add_dried_stock",
          "retire_batch",
          "unknown",
        ],
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
      needsClarification: { type: "boolean" },
      clarification: { type: ["string", "null"] },
    },
    required: [
      "action",
      "summary",
      "batchId",
      "species",
      "quantity",
      "unit",
      "phase",
      "location",
      "grams",
      "cultureType",
      "storage",
      "needsClarification",
      "clarification",
    ],
  },
};

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured" }, { status: 503 });
  }

  const body = (await request.json()) as RequestBody;
  const message = body.message?.trim();
  if (!message || !body.state) {
    return NextResponse.json({ error: "Message and current state are required" }, { status: 400 });
  }

  const stateSummary = {
    cultures: body.state.cultures.map((culture) => ({
      id: culture.id,
      species: culture.species,
      type: culture.type,
      storage: culture.storage,
      qty: culture.qty,
    })),
    batches: body.state.batches.map((batch) => ({
      id: batch.id,
      species: batch.species,
      phase: batch.phase,
      qty: batch.qty,
      unit: batch.qtyUnit,
      location: batch.location,
      flushCount: batch.flushes.length,
      latestFlush: batch.flushes.at(-1) ?? null,
    })),
    inventory: body.state.inventory,
  };

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      reasoning: { effort: "minimal" },
      instructions: [
        "You interpret mushroom cultivation log entries for MycoFlow.",
        "Return exactly one proposed action by calling the provided function.",
        "Use an existing batch ID when the user's wording clearly matches one current batch.",
        "Never invent a batch ID, species, weight, quantity, location, or stage.",
        "When multiple records could match or a required value is missing, set needsClarification true and ask one short question.",
        "For phrases like 'dried to 59 grams', use dry_weight and match the batch currently drying.",
        "For fresh harvest weights, use harvest. For standalone dried inventory, use add_dried_stock.",
        "Keep summary short and explicit.",
      ].join(" "),
      input: `Current MycoFlow data:\n${JSON.stringify(stateSummary)}\n\nUser update:\n${message}`,
      tools: [actionTool],
      tool_choice: { type: "function", name: "propose_mycoflow_action" },
    });

    const call = response.output.find((item) => item.type === "function_call");
    if (!call || call.type !== "function_call") {
      return NextResponse.json({ error: "No action was produced" }, { status: 502 });
    }

    return NextResponse.json({ proposal: JSON.parse(call.arguments) });
  } catch (error) {
    console.error("AI command error", error);
    return NextResponse.json({ error: "The AI command could not be interpreted" }, { status: 500 });
  }
}
