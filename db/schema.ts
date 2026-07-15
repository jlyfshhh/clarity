import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const habitats = sqliteTable("habitats", {
  id: text("id").primaryKey(),
  sharedHabitatId: text("shared_habitat_id").notNull(),
  name: text("name").notNull(),
  kind: text("kind").notNull(),
  location: text("location").notNull(),
  volumeGallons: real("volume_gallons"),
  volumeLabel: text("volume_label").notNull(),
  livestock: text("livestock").notNull(),
  linkedToShed: integer("linked_to_shed", { mode: "boolean" }).notNull(),
});

export const aquaticTasks = sqliteTable("aquatic_tasks", {
  id: text("id").primaryKey(),
  habitatId: text("habitat_id").notNull(),
  title: text("title").notNull(),
  details: text("details").notNull(),
  category: text("category").notNull(),
  dueDate: text("due_date").notNull(),
});

export const aquaticEvents = sqliteTable("aquatic_events", {
  id: text("id").primaryKey(),
  taskId: text("task_id"),
  habitatId: text("habitat_id").notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  dueDate: text("due_date"),
  occurredAt: text("occurred_at").notNull(),
  actorRole: text("actor_role").notNull(),
}, (table) => [uniqueIndex("aquatic_event_task_due_unique").on(table.taskId, table.dueDate)]);

export const waterReadings = sqliteTable("water_readings", {
  id: text("id").primaryKey(),
  habitatId: text("habitat_id").notNull(),
  parameter: text("parameter").notNull(),
  value: real("value").notNull(),
  unit: text("unit").notNull(),
  recordedAt: text("recorded_at").notNull(),
  actorRole: text("actor_role").notNull(),
}, (table) => [index("water_readings_habitat_date_idx").on(table.habitatId, table.recordedAt)]);
