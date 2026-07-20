"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Role = "Owner" | "Zookeeper";
type Tab = "today" | "tanks" | "water" | "more";
type Habitat = { id: string; sharedHabitatId: string; name: string; kind: string; location: string; volumeGallons: number | null; volumeLabel: string; livestock: string; linkedToShed: boolean | number };
type Task = { id: string; habitatId: string; habitatName: string; kind: string; title: string; details: string; category: string; dueDate: string; complete: boolean | number };
type Event = { id: string; habitatName: string; title: string; category: string; occurredAt: string; actorRole: string };
type Reading = { id: string; habitatId: string; habitatName: string; parameter: string; value: number; unit: string; recordedAt: string; actorRole: string };
type DashboardData = { date: string; habitats: Habitat[]; tasks: Task[]; recentEvents: Event[]; readings: Reading[] };

const nav: Array<{ id: Tab; label: string; glyph: string }> = [
  { id: "today", label: "Today", glyph: "≈" }, { id: "tanks", label: "Tanks", glyph: "▣" },
  { id: "water", label: "Water", glyph: "◌" }, { id: "more", label: "More", glyph: "•••" },
];
const formatDate = (date: string) => new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date(`${date}T12:00:00`));
const shortDate = (date: string) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(`${date}T12:00:00`));
const timeAgo = (value: string) => {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 1) return "just now"; if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60); return hours < 24 ? `${hours}h ago` : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(value));
};

export default function ClarityApp() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [role, setRole] = useState<Role>("Owner");
  const [busyTask, setBusyTask] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [reading, setReading] = useState({ habitatId: "reef", parameter: "nitrate", value: "", unit: "ppm" });

  const refresh = async () => {
    const response = await fetch("/api/dashboard", { cache: "no-store" });
    if (!response.ok) throw new Error("Dashboard unavailable");
    setData(await response.json());
  };
  useEffect(() => {
    // Deferred a tick so the effect body itself never sets state (react-hooks/set-state-in-effect).
    const initial = window.setTimeout(() => refresh().catch(() => setToast("Couldn’t load your water records yet.")), 0);
    const timer = window.setInterval(() => refresh().catch(() => undefined), 15000);
    return () => { window.clearTimeout(initial); window.clearInterval(timer); };
  }, []);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(null), 2800); };

  const completeTask = async (task: Task) => {
    setBusyTask(task.id);
    try {
      const response = await fetch("/api/tasks/complete", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ taskId: task.id, dueDate: task.dueDate, actorRole: role }) });
      if (!response.ok) throw new Error(); await refresh(); notify(`${task.habitatName}: ${task.title} recorded`);
    } catch { notify("That update didn’t save. Please try again."); } finally { setBusyTask(null); }
  };

  const recordReading = async (event: FormEvent) => {
    event.preventDefault();
    const value = Number(reading.value);
    if (!Number.isFinite(value) || reading.value.trim() === "") { notify("Enter a numeric reading first."); return; }
    try {
      const response = await fetch("/api/readings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...reading, value, actorRole: role }) });
      if (!response.ok) throw new Error(); await refresh(); setReading((current) => ({ ...current, value: "" })); notify("Water reading saved");
    } catch { notify("That reading didn’t save. Please try again."); }
  };

  const todayTasks = data?.tasks.filter((task) => task.dueDate === data.date) ?? [];
  const pending = todayTasks.filter((task) => !task.complete);
  const completed = todayTasks.filter((task) => Boolean(task.complete));
  const upcoming = data?.tasks.filter((task) => task.dueDate > data.date).slice(0, 5) ?? [];
  const completion = todayTasks.length ? Math.round((completed.length / todayTasks.length) * 100) : 0;
  const latestReadingByTank = useMemo(() => {
    const map = new Map<string, Reading>(); for (const item of data?.readings ?? []) if (!map.has(item.habitatId)) map.set(item.habitatId, item); return map;
  }, [data?.readings]);
  const filteredHabitats = useMemo(() => {
    const needle = query.trim().toLowerCase(); if (!needle) return data?.habitats ?? [];
    return (data?.habitats ?? []).filter((tank) => `${tank.name} ${tank.kind} ${tank.location} ${tank.livestock}`.toLowerCase().includes(needle));
  }, [data?.habitats, query]);

  return <div className="app-shell">
    <aside className="desktop-rail" aria-label="Primary navigation"><div className="brand-mark" aria-hidden="true" />
      <nav>{nav.map((item) => <button key={item.id} className={activeTab === item.id ? "active" : ""} onClick={() => setActiveTab(item.id)}><b>{item.glyph}</b><span>{item.label}</span></button>)}</nav>
    </aside>
    <main>
      <header className="topbar"><button className="wordmark" onClick={() => setActiveTab("today")} aria-label="Open today dashboard"><span className="mini-mark" aria-hidden="true" /><span><b>Clarity</b><small>Know your water</small></span></button>
        <button className={`role-chip ${role.toLowerCase()}`} onClick={() => setRole(role === "Owner" ? "Zookeeper" : "Owner")}><span>{role === "Owner" ? "O" : "Z"}</span>{role}<i>⌄</i></button></header>
      {!data ? <section className="loading-state" aria-live="polite"><div className="loader" /><h1>Reading the room…</h1></section> : activeTab === "today" ?
        <section className="page today-page"><div className="eyebrow">{formatDate(data.date)}</div><div className="page-heading"><div><h1>Water at a glance</h1><p>{pending.length ? `${pending.length} tank still needs attention.` : "Today’s aquatic care is complete."}</p></div>{role === "Owner" && <button className="quiet-button" onClick={() => setActiveTab("more")}>Manage routines</button>}</div>
          <article className="progress-card"><div className="progress-copy"><span className="water-disc" aria-hidden="true">≈</span><div><strong>{completed.length} of {todayTasks.length} complete</strong><span>{pending.length ? "One current, shared care list" : "Everything is flowing"}</span></div></div><div className="progress-track" aria-label={`${completion}% complete`}><span style={{ width: `${completion}%` }} /></div><b>{completion}%</b></article>
          <div className="section-title"><h2>Up next</h2><span>{pending.length} remaining</span></div><div className="task-list">{pending.map((task) => <article className="task-card" key={task.id}><div className="tank-badge" aria-hidden="true">{task.habitatName.slice(0, 1)}</div><div className="task-copy"><span>{task.category} · {task.kind}</span><h3>{task.habitatName}</h3><p><b>{task.title}</b> · {task.details}</p></div><button className="complete-button" disabled={busyTask === task.id} onClick={() => completeTask(task)}>{busyTask === task.id ? "Saving…" : "Mark done"}<span>✓</span></button></article>)}{!pending.length && <div className="empty-card"><span>✓</span><h3>Today is clear</h3><p>No scheduled aquarium tasks remain.</p></div>}</div>
          <div className="dashboard-split"><div><div className="section-title compact"><h2>Coming up</h2><span>Next maintenance</span></div><div className="upcoming-list">{upcoming.map((task) => <div key={task.id}><span>{shortDate(task.dueDate)}</span><p><b>{task.habitatName}</b>{task.title}</p></div>)}</div></div><div><div className="section-title compact"><h2>Recent activity</h2><button onClick={() => setActiveTab("tanks")}>View tanks</button></div><div className="activity-list">{data.recentEvents.slice(0, 5).map((item) => <div key={item.id}><span className="activity-dot" /><p><b>{item.habitatName}</b> · {item.title}<small>{item.actorRole} · {timeAgo(item.occurredAt)}</small></p></div>)}</div></div></div>
        </section> : activeTab === "tanks" ?
        <section className="page"><div className="eyebrow">Eight aquatic systems</div><div className="page-heading"><div><h1>Tanks & ponds</h1><p>Each habitat has its own livestock, maintenance, and water history.</p></div></div><label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tanks, livestock, or rooms" /></label><div className="tank-grid">{filteredHabitats.map((tank) => { const latest = latestReadingByTank.get(tank.id); return <article className="tank-card" key={tank.id}><div className="tank-card-top"><span>{tank.kind}</span>{Boolean(tank.linkedToShed) && <b className="linked-chip">⌁ Linked to Shed</b>}</div><h2>{tank.name}</h2><p>{tank.livestock}</p><div className="tank-stats"><span><small>HOME</small>{tank.location}</span><span><small>SYSTEM</small>{tank.volumeLabel}</span></div><footer>{latest ? <span><b>{latest.value} {latest.unit}</b> latest {latest.parameter}</span> : <span className="no-reading">No water readings yet</span>}<button onClick={() => { setReading((current) => ({ ...current, habitatId: tank.id })); setActiveTab("water"); }}>Log test</button></footer></article>; })}</div></section> : activeTab === "water" ?
        <section className="page"><div className="eyebrow">Parameters & observations</div><div className="page-heading"><div><h1>Water log</h1><p>Record what the test says—Clarity won’t confuse clear-looking water with healthy water.</p></div></div><div className="water-layout"><form className="reading-form" onSubmit={recordReading}><div><span className="settings-icon">◌</span><h2>New reading</h2><p>Values are saved with the tank, time, unit, and keeper role.</p></div><label>Tank<select value={reading.habitatId} onChange={(event) => setReading({ ...reading, habitatId: event.target.value })}>{data.habitats.map((tank) => <option value={tank.id} key={tank.id}>{tank.name}</option>)}</select></label><div className="form-row"><label>Parameter<select value={reading.parameter} onChange={(event) => setReading({ ...reading, parameter: event.target.value, unit: ({ temperature: "°F", ph: "pH", ammonia: "ppm", nitrite: "ppm", nitrate: "ppm", salinity: "ppt", alkalinity: "dKH", calcium: "ppm", magnesium: "ppm" } as Record<string,string>)[event.target.value] })}><option value="temperature">Temperature</option><option value="ph">pH</option><option value="ammonia">Ammonia</option><option value="nitrite">Nitrite</option><option value="nitrate">Nitrate</option><option value="salinity">Salinity</option><option value="alkalinity">Alkalinity</option><option value="calcium">Calcium</option><option value="magnesium">Magnesium</option></select></label><label>Value<div className="value-input"><input inputMode="decimal" value={reading.value} onChange={(event) => setReading({ ...reading, value: event.target.value })} placeholder="0" /><span>{reading.unit}</span></div></label></div><button type="submit">Save reading</button></form><div><div className="section-title form-title"><h2>Latest readings</h2><span>{data.readings.length} recorded</span></div><div className="reading-list">{data.readings.slice(0, 12).map((item) => <div key={item.id}><span>{item.habitatName.slice(0, 1)}</span><p><b>{item.habitatName}</b><small>{item.parameter} · {timeAgo(item.recordedAt)}</small></p><strong>{item.value} <small>{item.unit}</small></strong></div>)}{!data.readings.length && <div className="empty-reading"><span>◌</span><h3>Your first baseline starts here</h3><p>No water tests have been entered yet.</p></div>}</div></div></div></section> :
        <section className="page"><div className="eyebrow">Household controls</div><div className="page-heading"><div><h1>More</h1><p>Shared access, open data, linked habitats, and routines.</p></div></div><article className="settings-card role-panel"><div><span className="settings-icon">{role === "Owner" ? "O" : "Z"}</span><div><h2>{role} view</h2><p>{role === "Owner" ? "Full access to routines, records, exports, and household access." : "Can complete care and record water tests without changing schedules or deleting history."}</p></div></div><button onClick={() => setRole(role === "Owner" ? "Zookeeper" : "Owner")}>Preview {role === "Owner" ? "Zookeeper" : "Owner"}</button></article><div className="settings-grid"><article className="settings-card"><span className="settings-icon">⌁</span><h2>Linked habitats</h2><p>Paludarium and Taki’s Tank share stable habitat IDs with Shed. Notes and enclosure identity can stay unified while each app tracks its own kind of care.</p><div className="linked-row"><span>Paludarium</span><b>Shed ↔ Clarity</b></div><div className="linked-row"><span>Taki’s Tank</span><b>Shed ↔ Clarity</b></div></article><article className="settings-card"><span className="settings-icon">↥</span><h2>Your data, always portable</h2><p>Download a complete open-format copy with stable identifiers, ISO timestamps, and numeric test values.</p><div className="export-actions"><a href="/api/export?format=json">Download JSON</a><a href="/api/export?format=csv">Download CSV</a></div></article><article className="settings-card"><span className="settings-icon">⌂</span><h2>Household access</h2><p>Owner and Zookeeper permissions support shared care from multiple phones.</p><div className="linked-row"><span>Owner</span><b>Full access</b></div><div className="linked-row"><span>Zookeeper</span><b>Record care</b></div></article><article className={`settings-card ${role === "Zookeeper" ? "locked" : ""}`}><span className="settings-icon">☷</span><h2>Tank routines</h2><p>Feeding, top-offs, water changes, testing, filter maintenance, and dosing schedules live here.</p><button disabled={role === "Zookeeper"}>{role === "Zookeeper" ? "Owner access required" : "Manage routines"}</button></article></div></section>}
      <nav className="mobile-nav" aria-label="Primary navigation">{nav.map((item) => <button key={item.id} className={activeTab === item.id ? "active" : ""} onClick={() => setActiveTab(item.id)}><b>{item.glyph}</b><span>{item.label}</span></button>)}</nav>{toast && <div className="toast" role="status">{toast}</div>}
    </main>
  </div>;
}
