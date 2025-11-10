# Taskly HR — Starter (Sprint 1)

Single-app starter (Next.js + TypeScript) dengan mock API (json-server).
Cocok buat Sprint 1: login dummy → dashboard → list employees (read-only).

## Quick Start

```bash
# 1) masuk folder web dan install deps
cd web
npm i

# 2) copy env
cp .env.example .env.local

# 3) balik ke root, jalanin FE + mock API bareng
cd ..
bash scripts/dev:mock.sh
```

- Next.js jalan di **http://localhost:3000**
- Mock API (json-server) jalan di **http://localhost:3001**

## Folder
```
taskly-hr/
├─ web/            # Aplikasi Next.js (App Router)
├─ mocks/          # db.json (employees, attendance, leave)
├─ docs/           # dokumen arsitektur & catatan sprint
├─ .github/workflows/ci.yml
└─ scripts/dev:mock.sh
```

## Conventional Branch/Commit

- Branch: `feature/<slug>`, `fix/<slug>`, `chore/<slug>`
- Commit: `feat(employees): add list page`, `fix(attendance): date parsing`

## Definition of Done (Sprint 1)
- Login dummy → Dashboard → Employees List.
- CI lulus (lint + typecheck).
- README & .env.example jelas.
