import { ensureDatabase } from "@/db/runtime";

export async function POST(request: Request) {
  try {
    const payload = await request.json() as { taskId?: string; dueDate?: string; actorRole?: string };
    if (!payload.taskId || !payload.dueDate) return Response.json({ error: "Task and due date are required" }, { status: 400 });
    const db = await ensureDatabase();
    const task = await db.prepare("SELECT id, habitat_id AS habitatId, title, category FROM aquatic_tasks WHERE id=? AND due_date=?").bind(payload.taskId, payload.dueDate).first<{ id: string; habitatId: string; title: string; category: string }>();
    if (!task) return Response.json({ error: "Task not found" }, { status: 404 });
    await db.prepare("INSERT OR IGNORE INTO aquatic_events (id, task_id, habitat_id, title, category, due_date, occurred_at, actor_role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(crypto.randomUUID(), task.id, task.habitatId, task.title, task.category, payload.dueDate, new Date().toISOString(), payload.actorRole === "Owner" ? "Owner" : "Zookeeper").run();
    return Response.json({ saved: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to record task" }, { status: 500 });
  }
}
