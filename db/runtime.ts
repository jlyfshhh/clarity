import { env } from "cloudflare:workers";

const today = "2026-07-14";

const habitatRows = [
  ["paludarium", "habitat-paludarium", "Paludarium", "Paludarium", "Indoor aquatic habitat", 36, "36 × 18 × 36 Exo Terra Pro", "Harlequin rasboras, neocaridina shrimp, ramshorn snails, vampire crabs", 1],
  ["community-tank", "habitat-community-freshwater", "Living Room Tank", "Freshwater community", "Indoor aquatic habitat", 20, "20 gallon long", "20+ platys, cory catfish, sunset thick-lipped gourami", 0],
  ["reef", "habitat-reef", "Reef Tank", "Saltwater reef", "Indoor aquatic habitat", 13.5, "Fluval EVO 13.5", "2 ocellaris clownfish, yellow watchman goby, pistol shrimp, Mexican turbo snail, hermit crabs, corals", 0],
  ["taki", "habitat-taki", "Taki’s Tank", "Turtle habitat", "Indoor aquatic habitat", 75, "75 gallon with basking box", "Taki and approximately 40 feeder guppies", 1],
  ["oscar", "habitat-oscar", "Mr. Oscar", "Freshwater betta", "Indoor aquatic habitat", 14, "14 gallon cube", "Mr. Oscar, betta", 0],
  ["nani", "habitat-nani", "Nani", "Freshwater betta", "Indoor aquatic habitat", 10, "10 gallon", "Nani, betta", 0],
  ["tetra-frog-tank", "habitat-community-tetras", "Dining Room Tank", "Freshwater community", "Indoor aquatic habitat", 24, "Approximately 24 gallon frameless Landen", "Neon tetras, orange-streaked lantern tetra, African dwarf frogs", 0],
  ["pond", "habitat-ricefish-pond", "Porch Pond", "Outdoor pond", "Outdoor aquatic habitat", null, "Porch pond", "Ricefish", 0],
] as const;

const taskRows = [
  ["living-feed", "community-tank", "Feed community tank", "Fluval Bug Bites", "Feeding", today],
  ["paludarium-feed", "paludarium", "Feed rasboras", "Fluval Bug Bites", "Feeding", today],
  ["taki-feed", "taki", "Feed guppy population", "Feed the guppies in Taki’s habitat", "Feeding", today],
  ["reef-feed", "reef", "Feed reef fish", "Marine Life pellets", "Feeding", today],
  ["dining-feed", "tetra-frog-tank", "Feed dining room tank", "Tetras and African dwarf frogs", "Feeding", today],
  ["oscar-feed", "oscar", "Feed Mr. Oscar", "Regular betta feeding", "Feeding", today],
  ["nani-feed", "nani", "Feed Nani", "Regular betta feeding", "Feeding", today],
  ["pond-feed", "pond", "Feed ricefish", "Fluval Bug Bites", "Feeding", today],
  ["paludarium-topoff", "paludarium", "Top off evaporated water", "Use distilled water", "Maintenance", "2026-07-18"],
  ["reef-topoff", "reef", "Top off evaporated water", "Use distilled water", "Maintenance", "2026-07-18"],
  ["taki-topoff", "taki", "Top off evaporated water", "Use distilled water", "Maintenance", "2026-07-18"],
] as const;

const eventRows = [
  ["seed-paludarium-feed", "paludarium-feed", "paludarium", "Fed rasboras", "Feeding", today, `${today}T13:35:00-04:00`, "Zookeeper"],
  ["seed-taki-feed", "taki-feed", "taki", "Fed guppy population", "Feeding", today, `${today}T13:38:00-04:00`, "Zookeeper"],
  ["seed-reef-feed", "reef-feed", "reef", "Fed reef fish", "Feeding", today, `${today}T13:41:00-04:00`, "Zookeeper"],
  ["seed-dining-feed", "dining-feed", "tetra-frog-tank", "Fed dining room tank", "Feeding", today, `${today}T13:44:00-04:00`, "Zookeeper"],
  ["seed-oscar-feed", "oscar-feed", "oscar", "Fed Mr. Oscar", "Feeding", today, `${today}T13:47:00-04:00`, "Zookeeper"],
  ["seed-nani-feed", "nani-feed", "nani", "Fed Nani", "Feeding", today, `${today}T13:49:00-04:00`, "Zookeeper"],
  ["seed-pond-feed", "pond-feed", "pond", "Fed ricefish", "Feeding", today, `${today}T13:52:00-04:00`, "Zookeeper"],
] as const;

export async function ensureDatabase() {
  const db = env.DB;
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS habitats (id TEXT PRIMARY KEY, shared_habitat_id TEXT NOT NULL, name TEXT NOT NULL, kind TEXT NOT NULL, location TEXT NOT NULL, volume_gallons REAL, volume_label TEXT NOT NULL, livestock TEXT NOT NULL, linked_to_shed INTEGER NOT NULL DEFAULT 0)"),
    db.prepare("CREATE TABLE IF NOT EXISTS aquatic_tasks (id TEXT PRIMARY KEY, habitat_id TEXT NOT NULL, title TEXT NOT NULL, details TEXT NOT NULL, category TEXT NOT NULL, due_date TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS aquatic_events (id TEXT PRIMARY KEY, task_id TEXT, habitat_id TEXT NOT NULL, title TEXT NOT NULL, category TEXT NOT NULL, due_date TEXT, occurred_at TEXT NOT NULL, actor_role TEXT NOT NULL)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS aquatic_event_task_due_unique ON aquatic_events(task_id, due_date)"),
    db.prepare("CREATE TABLE IF NOT EXISTS water_readings (id TEXT PRIMARY KEY, habitat_id TEXT NOT NULL, parameter TEXT NOT NULL, value REAL NOT NULL, unit TEXT NOT NULL, recorded_at TEXT NOT NULL, actor_role TEXT NOT NULL)"),
    db.prepare("CREATE INDEX IF NOT EXISTS water_readings_habitat_date_idx ON water_readings(habitat_id, recorded_at)"),
  ]);
  await db.batch([
    ...habitatRows.map((row) => db.prepare("INSERT OR IGNORE INTO habitats (id, shared_habitat_id, name, kind, location, volume_gallons, volume_label, livestock, linked_to_shed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(...row)),
    ...taskRows.map((row) => db.prepare("INSERT OR IGNORE INTO aquatic_tasks (id, habitat_id, title, details, category, due_date) VALUES (?, ?, ?, ?, ?, ?)").bind(...row)),
    ...eventRows.map((row) => db.prepare("INSERT OR IGNORE INTO aquatic_events (id, task_id, habitat_id, title, category, due_date, occurred_at, actor_role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(...row)),
  ]);
  return db;
}
