# Docufast

API-first document infrastructure platform for Nigeria — client platform + BluetentBC integration.

## Structure
- `apps/web` — Next.js 14 frontend (Docufast client platform + Founder Dashboard)
- `services/docufast-api` — Docufast-specific backend (Express, Railway)
- `services/bluetentbc-api` — BluetentBC handoff backend (Express, Railway)

## Phase 0 setup
See `/docs/phase-0-checklist.md` for environment setup steps.

## Local development
```
cd apps/web && npm install && npm run dev
cd services/docufast-api && npm install && npm run dev
cd services/bluetentbc-api && npm install && npm run dev
```
