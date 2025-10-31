CRM Monorepo (Web + Desktop + Mobile)

Stack
- Frontend: TypeScript + Qwik (Qwik City) + React (via qwik-react) + Vite
- State/Realtime: Zustand + Yjs (CRDTs) + y-websocket
- UI: Tailwind CSS + Radix UI
- Desktop: Electron wrapper
- Mobile: Capacitor wrapper
- Backend: Fastify + Prisma (PostgreSQL) + y-websocket endpoint
- Docker: Postgres + Server service

Quick Start
- Prereqs: Node 18+, Docker, Git, optional: Android/iOS SDKs (for Capacitor), Rust (for advanced desktop packaging if desired).

- Install deps (root workspace):
  - npm install

- Dev: start server and web in separate terminals
  - npm run dev:server
  - npm run dev:web

- Desktop (Electron dev):
  - npm run dev:desktop

- Mobile (Capacitor scaffold):
  - cd apps/mobile && npm install && npx cap add android && npx cap add ios
  - npm run build:web (build the web app)
  - npx cap sync

- Database via Docker:
  - docker compose up -d
  - cd apps/server && npx prisma migrate dev

- Seed + Analytics test:
  - npm run seed
  - npm run test:analytics

Structure
- apps/
  - server: Fastify + Prisma + y-websocket
  - web: Qwik + Qwik City + Tailwind + Radix; integrates React components via qwik-react
  - desktop: Electron shell pointing to dev server or web build
  - mobile: Capacitor config wrapping the built web app
- packages/
  - ui: Shared React UI primitives styled with Tailwind + Radix
  - model: Zustand + Yjs CRDT bindings and helpers

Notes
- React components from `@crm/ui` are embedded in Qwik pages using `@builder.io/qwik-react`.
- CRDT layer uses Yjs with a WebSocket provider at `/yjs` on the backend.
- Prisma schema targets PostgreSQL. Dev runs through Docker Compose.
- Analytics endpoints available:
  - GET /api/analytics/overview
  - GET /api/analytics/revenue-monthly
  - GET /api/analytics/top-companies
  - GET /api/analytics/events-summary
  - Frontend page: `/analytics` with charts (Recharts via qwik-react)
