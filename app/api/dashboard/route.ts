import { ensureDatabase } from "@/db/runtime";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await ensureDatabase();
    const habitats = await db.prepare("SELECT id, shared_habitat_id AS sharedHabitatId, name, kind, location, volume_gallons AS volumeGallons, volume_label AS volumeLabel, livestock, linked_to_shed AS linkedToShed FROM habitats ORDER BY CASE WHEN location LIKE 'Indoor%' THEN 1 ELSE 2 END, name").all();
    const tasks = await db.prepare("SELECT t.id, t.habitat_id AS habitatId, h.name AS habitatName, h.kind, t.title, t.details, t.category, t.due_date AS dueDate, CASE WHEN e.id IS NULL THEN 0 ELSE 1 END AS complete FROM aquatic_tasks t JOIN habitats h ON h.id=t.habitat_id LEFT JOIN aquatic_events e ON e.task_id=t.id AND e.due_date=t.due_date ORDER BY t.due_date, complete, t.id").all();
    const events = await db.prepare("SELECT e.id, h.name AS habitatName, e.title, e.category, e.occurred_at AS occurredAt, e.actor_role AS actorRole FROM aquatic_events e JOIN habitats h ON h.id=e.habitat_id ORDER BY e.occurred_at DESC LIMIT 30").all();
    const readings = await db.prepare("SELECT r.id, r.habitat_id AS habitatId, h.name AS habitatName, r.parameter, r.value, r.unit, r.recorded_at AS recordedAt, r.actor_role AS actorRole FROM water_readings r JOIN habitats h ON h.id=r.habitat_id ORDER BY r.recorded_at DESC LIMIT 100").all();
    return Response.json({ date: "2026-07-14", habitats: habitats.results, tasks: tasks.results, recentEvents: events.results, readings: readings.results });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load Clarity" }, { status: 500 });
  }
}
