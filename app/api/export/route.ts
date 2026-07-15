import { ensureDatabase } from "@/db/runtime";

const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export async function GET(request: Request) {
  const db = await ensureDatabase();
  const [habitats, tasks, events, readings] = await Promise.all([
    db.prepare("SELECT * FROM habitats ORDER BY id").all(),
    db.prepare("SELECT * FROM aquatic_tasks ORDER BY due_date, id").all(),
    db.prepare("SELECT * FROM aquatic_events ORDER BY occurred_at").all(),
    db.prepare("SELECT * FROM water_readings ORDER BY habitat_id, recorded_at").all(),
  ]);
  const bundle = { exportedAt: new Date().toISOString(), schemaVersion: 1, habitats: habitats.results, aquaticTasks: tasks.results, aquaticEvents: events.results, waterReadings: readings.results };
  if (new URL(request.url).searchParams.get("format") === "csv") {
    const lines = ["record_type,data_json", ...Object.entries(bundle).flatMap(([kind, rows]) => Array.isArray(rows) ? rows.map((row) => `${csvCell(kind)},${csvCell(JSON.stringify(row))}`) : [])];
    return new Response(lines.join("\n"), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": "attachment; filename=clarity-export.csv" } });
  }
  return new Response(JSON.stringify(bundle, null, 2), { headers: { "content-type": "application/json; charset=utf-8", "content-disposition": "attachment; filename=clarity-export.json" } });
}
