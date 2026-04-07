# Workspace

## Overview

Music Teaching Platform (Maestro Academy) — A full-stack web application for online music lessons with separate teacher and student dashboards, class scheduling, announcements, and video calls via Jitsi Meet.

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
- Teacher dashboard: student management, class scheduling, announcements
- Student dashboard: view classes, announcements, join video calls
- Video calls via Jitsi Meet (high-quality audio)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── music-school/       # React + Vite frontend
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
```

## DB Schema

- `students` — student records with auto-generated IDs
- `classes` — scheduled classes with status, topic, meeting link
- `announcements` — pinned/regular announcements from teacher

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
