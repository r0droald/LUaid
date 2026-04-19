# kapwahelp.org

**Open-source disaster relief operations for La Union, Philippines.**

When Typhoon Emong hit La Union in 2025, volunteers self-organized across municipalities to distribute meals, relief goods, drinking water, and medical supplies. Coordination happened over group chats. Tracking happened in spreadsheets — when it happened at all. Kapwa Help was born out of that experience: a transparency and coordination tool built by the people who were on the ground, designed so the next disaster response starts where this one left off.

Kapwa Help is a Progressive Web App that tracks donations, volunteer deployments, and aid distribution in real time. It's built for offline-first use in low-connectivity disaster zones, runs entirely on free-tier services, and supports English, Filipino, and Ilocano.

We publish this software openly in the hope that it's useful for disaster relief operations in your community too.

![Kapwa Help dashboard](docs/dashboard-screenshot.png)

## What It Does

- **Relief map** — field-reported needs, hazards, and deployment hubs on a Leaflet/OpenStreetMap layer, with status-coded pins and lifecycle tracking (pending → verified → in transit → confirmed)
- **Transparency dashboard** — live totals for donations, purchases, and beneficiaries, plus barangay-level distribution equity and hub inventory
- **Report form** — multi-form reporter for needs, hazards, donations, and purchases, with offline-capable submission queueing
- **Offline-capable PWA** — the app shell is precached on-device via service worker; map tiles and dashboard data use stale-while-revalidate caching
- **Multilingual** — English, Filipino, and Ilocano with a one-click language switcher
- **Zero-budget infrastructure** — Supabase free tier for the database and auth, Vercel for hosting, no paid services

## Quick Start

```bash
git clone https://github.com/kapwa-help/kapwa-help.git
cd kapwa-help
npm install
npm run dev
```

You'll need a `.env.local` file with Supabase credentials. See [docs/architecture.md](docs/architecture.md) for the system overview, database schema, and seed data flow.

## Tech Stack

| Layer | Tool |
|-------|------|
| App | [Vite](https://vitejs.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Database | [Supabase](https://supabase.com/) (Postgres + Row Level Security) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) with semantic design tokens |
| Maps | [Leaflet](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/) |
| i18n | [react-i18next](https://react.i18next.com/) |
| PWA | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Workbox) |
| Testing | [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) |

For architecture decisions, database schema, and system design details, see [docs/architecture.md](docs/architecture.md).

## Get Involved

Kapwa Help is a volunteer-driven project and we welcome help from anyone — developers, designers, writers, translators, relief coordinators, or anyone who wants to contribute. Every skill set has a place here.

Check the [Issues](https://github.com/kapwa-help/kapwa-help/issues) tab to find something to work on, or open a new issue if you have ideas.

## Documentation

| Doc | What's inside |
|-----|---------------|
| [Architecture](docs/architecture.md) | System design, routes, database schema, RLS policies, key decisions |
| [Design System](docs/design-system.md) | Color tokens, typography, component patterns |
| [i18n Guide](docs/i18n.md) | Translation workflow, script usage, namespace conventions |
| [Verification Protocol](docs/verification-protocol.md) | How to run and filter Playwright smoke tests |
| [Project History](docs/project-history.md) | Origin story, goals, and project direction |
| [Project Scope](docs/scope.md) | KapwaRelief charter and product scope |

## License

MIT License — see [LICENSE](LICENSE). We encourage community collaboration and repurposing of this work for disaster relief anywhere.
