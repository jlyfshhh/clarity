# Clarity

**Know your water.** Clarity is a shared household aquarium and pond care tracker built for water tests, maintenance, feeding, livestock groups, equipment, and long-term history.

Clarity is a companion to [Shed](https://github.com/jlyfshhh/shed), the terrestrial-animal husbandry tracker. Mixed habitats use stable shared habitat IDs so a paludarium or turtle aquarium can appear in both apps without pretending that terrestrial and aquatic care are the same thing.

## What the first version includes

- A shared daily aquarium-care list that works across phones
- Owner and Zookeeper permission concepts
- Tank and pond records organized by physical system
- Linked Shed habitats for the Paludarium and Taki's Tank
- Water readings with tank, parameter, unit, timestamp, and keeper role
- Feeding and maintenance history
- JSON and CSV data exports
- Responsive phone and desktop layouts

## Data principles

- One physical habitat has one stable `shared_habitat_id` across companion apps.
- Operational records use ordinary relational tables and ISO timestamps.
- JSON and CSV exports keep migration straightforward.
- The future Raspberry Pi edition will use SQLite and automatic dated backups.
- Shed and Clarity remain separate services so one app cannot take down the other.

## Local development

```bash
npm install
npm run dev
```

The hosted preview build uses a D1-compatible SQLite database. The planned Raspberry Pi distribution will use FastAPI and SQLite while preserving this data model and interface.

## Project status

Clarity is in active development. The current interface and data model are ready; routine management, equipment records, livestock changes, alerts, and the Pi installer are the next major milestones.
