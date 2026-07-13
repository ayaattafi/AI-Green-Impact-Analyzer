# GREENLY

GREENLY is a sustainability-tracking web app. Users log everyday activities
across six categories — carbon, water, energy, food, waste, and electronics —
and get back a predicted environmental impact, a green score, and trends over
time, backed by real regression models instead of static formulas.

## Stack

- **Frontend**: React 18 + TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix
  primitives), react-router-dom, recharts, Supabase JS client.
- **ML service**: FastAPI microservice (`ml-service/`) that trains and serves
  the regression models behind each calculator. See
  [`ml-service/README.md`](./ml-service/README.md) for training details and
  the API contract.
- **Backend**: Supabase (PostgreSQL + Auth + row-level security). Schema
  lives in [`supabase/migrations`](./supabase/migrations).

## Project structure

```
src/
  pages/
    app/            # authenticated app: dashboard, calculators, history, reports...
    app/calculators/
    auth/           # login, register, password reset
  components/       # shared UI (shadcn/ui-based)
  services/         # API/Supabase client calls
  lib/              # navigation, utilities
ml-service/         # FastAPI ML microservice (see its own README)
supabase/migrations/
```

## Local development

Frontend:

```bash
npm install
cp .env.example .env   # fill in your Supabase project URL/anon key
npm run dev
```

ML service (see [`ml-service/README.md`](./ml-service/README.md) for the full
training pipeline):

```bash
cd ml-service
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Other scripts: `npm run build`, `npm run lint`, `npm run typecheck`.

## Docker

```bash
docker compose up --build
```

This builds and runs both services: the ML API on `:8000` and the frontend
(served by nginx) on `:8080`. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
and optionally `ML_API_KEY` in your environment or a `.env` file before
running — see `.env.example`.
