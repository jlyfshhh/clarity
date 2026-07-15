<p align="center">
  <img src="site/clarity-logo.svg" width="240" alt="Clarity">
</p>

<p align="center">
  <b>Know your water.</b><br>
  A shared household aquarium &amp; pond tracker — water tests, maintenance, feeding, livestock, and long-term history.
</p>

<p align="center">
  <a href="#license"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-5AC3C4"></a>
  <img alt="Status" src="https://img.shields.io/badge/status-early%20development-167F86">
  <img alt="Stack" src="https://img.shields.io/badge/Next.js%2016-Cloudflare%20Workers-123E49">
  <a href="https://ko-fi.com/jlyfshhh"><img alt="Ko-fi" src="https://img.shields.io/badge/Ko--fi-buy%20crickets-FF5E5B?logo=ko-fi&logoColor=white"></a>
</p>

---

Clarity is a small, shared dashboard for households that keep aquariums and ponds. Clear-looking water isn't the same as healthy water — Clarity keeps one calm care list across everyone's phones and records what the tests actually say: parameter, value, unit, tank, time, and who logged it. Over time that becomes the history that catches a drifting tank before the fish do.

> **The idea:** record what the test says — don't confuse clear-looking water with healthy water.

## The animal-room family

Clarity is one of three companion projects for keepers:

| | Project | What it watches |
|---|---|---|
| ☀️ | **[Bask](https://github.com/jlyfshhh/bask)** | The environment — live temperature & humidity from Bluetooth sensors, on a wall display |
| 🐍 | **[Shed](https://github.com/jlyfshhh/shed)** | The care — feeding, weights, enclosure work, and history for terrestrial animals |
| 💧 | **Clarity** *(this repo)* | The water — aquarium & pond tests, maintenance, and livestock |

Mixed habitats use a stable **`shared_habitat_id`**, so a paludarium or turtle tank can appear in both Shed and Clarity without pretending terrestrial and aquatic care are the same thing.

## What the first version includes

- A shared daily aquarium-care list that works across phones
- Owner and Zookeeper permission concepts
- Tank and pond records organized by physical system
- Linked Shed habitats for mixed systems (e.g. a paludarium)
- Water readings with tank, parameter, unit, timestamp, and keeper role
- Feeding and maintenance history
- JSON and CSV data exports
- Responsive phone and desktop layouts

## Data principles

- One physical habitat has one stable `shared_habitat_id` across companion apps.
- Operational records use ordinary relational tables and ISO timestamps.
- JSON and CSV exports keep migration straightforward — your data is never trapped.
- The future Raspberry Pi edition will use SQLite and automatic dated backups.
- Shed and Clarity remain separate services so one app cannot take down the other.

## Local development

Clarity is a Next.js 16 app that runs on Cloudflare Workers with a D1-compatible SQLite database (Drizzle ORM). Node 22.13+.

```bash
npm install
npm run dev
```

The planned Raspberry Pi distribution will use FastAPI and SQLite — the same self-hosted, no-cloud model as Bask — while preserving this data model and interface.

## Project status

Clarity is in active development. The current interface and data model are ready; routine management, equipment records, livestock changes, alerts, and the Pi installer are the next major milestones.

## ⚠️ Fishkeeping disclaimer

Clarity records your readings; it doesn't interpret them for you. Safe parameter ranges vary by species, system, and maturity — verify your targets against trusted aquarium resources. Clarity is a tracking aid, not a substitute for proper research and care.

## License

MIT — see [LICENSE](LICENSE).

---

Built by **[jlyfshhh](https://github.com/jlyfshhh)**. I keep a room full of reptiles, amphibians, and aquatic systems — follow along on Instagram **[@thebioactivekeeper](https://instagram.com/thebioactivekeeper)** for the animals and bioactive builds behind these projects. 🐟 If Clarity helps your household, you can [buy the animals some crickets](https://ko-fi.com/jlyfshhh) (the fish prefer bloodworms).

> Built with the help of AI assistants (OpenAI Codex and Anthropic's Claude). Reviewed, tested, and deployed by a human (me).
