# Workspace

## Overview

Music Teaching Platform — **Sangeetavarshini** — A full-stack web application for online music lessons with separate teacher and student dashboards, class scheduling, class logs, per-student updates, announcements, push notifications, and video calls via Jitsi Meet.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **State management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Forms**: react-hook-form + zod

## Auth

- Teacher ID: `TEACHER-001`, Password: `password@123`
- Students: auto-generated IDs (format `STU-XXXX`), Password: `password@123` (same for all)
- Session-based auth via express-session + cookies

## Features

- Dual login (Teacher / Student)
- Teacher dashboard: student management, class scheduling with student selector and recurring options, class logs, per-student updates, announcements
- Student dashboard: view classes, class logs, updates, announcements, join video calls
- Video calls via Jitsi Meet
- Push notifications: VAPID-based web push, scheduler fires at 60/30/15/5 min before class
- Service worker registered at `public/sw.js`

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (port 3001 in dev)
│   └── music-school/       # React + Vite frontend (port 18900 in dev)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
```

## Dev Startup Architecture

The Replit workflow port monitor cannot detect the API server's port when run as a standalone workflow (platform limitation). As a workaround, the API server (`dist/index.cjs`, pre-built) starts as a **background process** inside the music-school's `dev` script on port 3001. Vite proxies `/api` requests to `http://localhost:3001`.

- **Only one workflow needed**: `artifacts/music-school: web`
- The `artifacts/api-server: API Server` artifact workflow is expected to show as "failed" — the API is running via the music-school workflow instead
- After any API server code changes: run `pnpm --filter @workspace/api-server run build` to rebuild `dist/index.cjs`, then restart the music-school workflow

## DB Schema

- `students` — student records with auto-generated IDs
- `classes` — scheduled classes with status, topic, meeting link, student_id, recurring
- `class_logs` — per-class log entries from teacher
- `student_updates` — per-student update notes from teacher
- `announcements` — pinned/regular announcements from teacher
- `push_subscriptions` — web push endpoint + keys per user

## API Routes

- `POST /api/auth/login` — login for teacher or student
- `GET /api/auth/me` — get current session user
- `POST /api/auth/logout` — logout
- `GET/POST /api/students` — list/create students (teacher only)
- `DELETE /api/students/:id` — delete student (teacher only)
- `GET/POST /api/classes` — list/create classes
- `PUT/DELETE /api/classes/:id` — update/delete class (teacher only)
- `GET/POST /api/announcements` — list/create announcements
- `DELETE /api/announcements/:id` — delete announcement (teacher only)
- `GET/POST /api/class-logs` — class log entries
- `GET/POST /api/updates` — per-student update notes
- `POST /api/push/subscribe` — register push subscription
- `GET /api/push/vapid-public-key` — get VAPID public key
