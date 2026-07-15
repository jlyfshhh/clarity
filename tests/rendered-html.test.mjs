import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Clarity replaces the starter with its product surface", async () => {
  const [page, layout, app, css, hosting] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/ClarityApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
  ]);
  assert.match(page, /ClarityApp/);
  assert.match(layout, /Know your water/);
  assert.match(app, /Water at a glance/);
  assert.match(app, /Linked habitats/);
  assert.match(css, /--aqua:#5ac3c4/);
  assert.match(hosting, /"d1": "DB"/);
  assert.doesNotMatch(`${page}${layout}${app}`, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});
