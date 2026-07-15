import { ensureDatabase } from "@/db/runtime";

const units: Record<string, string> = {
  temperature: "°F", ph: "pH", ammonia: "ppm", nitrite: "ppm", nitrate: "ppm",
  salinity: "ppt", alkalinity: "dKH", calcium: "ppm", magnesium: "ppm",
};

export async function POST(request: Request) {
  try {
    const payload = await request.json() as { habitatId?: string; parameter?: string; value?: number; unit?: string; actorRole?: string };
    const parameter = payload.parameter?.trim().toLowerCase();
    if (!payload.habitatId || !parameter || typeof payload.value !== "number" || !Number.isFinite(payload.value)) {
      return Response.json({ error: "Tank, parameter, and numeric value are required" }, { status: 400 });
    }
    const db = await ensureDatabase();
    const habitat = await db.prepare("SELECT id FROM habitats WHERE id=?").bind(payload.habitatId).first();
    if (!habitat) return Response.json({ error: "Tank not found" }, { status: 404 });
    await db.prepare("INSERT INTO water_readings (id, habitat_id, parameter, value, unit, recorded_at, actor_role) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(crypto.randomUUID(), payload.habitatId, parameter, payload.value, payload.unit?.trim() || units[parameter] || "", new Date().toISOString(), payload.actorRole === "Owner" ? "Owner" : "Zookeeper").run();
    return Response.json({ saved: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to save reading" }, { status: 500 });
  }
}
