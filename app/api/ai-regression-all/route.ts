import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const SECRET = "sherman-jesus-500-7f3a9c";

type BatchResult = {
  totalSuiteSize: number;
  start: number;
  count: number;
  passed: number;
  failed: number;
  failures: Array<{
    id: number;
    category: string;
    prompt: string;
    passed: boolean;
    errors: string[];
    result: unknown;
  }>;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("secret") !== SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const origin = url.origin;
  const batches = await Promise.all(
    Array.from({ length: 20 }, async (_, index) => {
      const start = index * 25;
      const response = await fetch(
        `${origin}/api/ai-regression?start=${start}&count=25&secret=${SECRET}`,
        { cache: "no-store" },
      );
      if (!response.ok) throw new Error(`Batch ${start} failed with ${response.status}`);
      return (await response.json()) as BatchResult;
    }),
  );

  const failures = batches.flatMap((batch) => batch.failures);
  const byCategory: Record<string, { passed: number; failed: number }> = {};
  for (const batch of batches) {
    for (const failure of batch.failures) {
      byCategory[failure.category] ??= { passed: 0, failed: 0 };
      byCategory[failure.category].failed += 1;
    }
  }

  return NextResponse.json({
    total: batches.reduce((sum, batch) => sum + batch.count, 0),
    passed: batches.reduce((sum, batch) => sum + batch.passed, 0),
    failed: batches.reduce((sum, batch) => sum + batch.failed, 0),
    failures,
    failedByCategory: Object.fromEntries(
      Object.entries(byCategory).map(([category, value]) => [category, value.failed]),
    ),
    batches: batches.map(({ start, count, passed, failed }) => ({ start, count, passed, failed })),
  });
}

// Deployment trigger: aggregate regression runner.
