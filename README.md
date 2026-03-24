# CreditPath by TNG — Powered by Experian

> Your TNG history. Your first step into credit.

A youth-first credit readiness platform combining thin-file 
credit scoring (#5) with ADMP-compliant AI explainability (#21).
Built for TNG Digital FINHACK 2026 — Financial Inclusion + 
Innovation tracks.

---

## Live Demo
- **Frontend (Lovable):** https://credit-path-frontend.lovable.app
- **Backend API:** https://e37fcc4b-dc6d-4821-85bc-7940a9476e3f-00-bxzh6v4v6i34.picard.replit.dev/health

## Repositories
- **Frontend:** https://github.com/creditpath-tng/creditpath-frontend
- **Backend:** https://github.com/creditpath-tng/creditpath-api

## Architecture
- Frontend: React + TypeScript + Tailwind CSS (Lovable)
- Backend: Python FastAPI (Replit)
- Scoring: 12-signal segment-adaptive credit model
- Auth: Bearer token (consumer + admin roles)

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| POST | /score | 12-signal credit scoring |
| POST | /explain | ADMP-compliant explanation |
| POST | /progress | Streak + gamification data |
| GET | /audit-log | Decision audit log |
| GET | /admin/model-config | Weight configuration |
| POST | /admin/simulate | Live impact preview |

## Demo Credentials
- Consumer token: `demo-token-creditpath-2026`
- Admin token: `admin-token-creditpath-2026`

## Demo Personas
| Persona | Age | Score | Tier |
|---------|-----|-------|------|
| Aishah | 22 | ~62 | Climber |
| Haziq | 25 | ~77 | Achiever |
| Priya | 23 | ~47 | Builder |
