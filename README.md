# OMR Exam Dashboard

OMR answer-key management system split into separate frontend and backend apps.

## Overview

This project now has two parts:

- `frontend/`: React + Vite UI for quiz selection, answer-key entry, bulk import, validation, and save flow
- `backend/`: Node server that reads quiz and OMR data from the database and exposes `/api/omr-sheets`

## Current Folder Structure

```text
omr-exam-dashboard/
├── backend/
│   ├── database/
│   │   └── schema.sql
│   ├── omrDb.js
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── package.json
├── package-lock.json
└── README.md
```

## Prerequisites

- Node.js 18+
- npm
- A valid database config in the root `.env`

Example `.env`:

```env
DB_HOST=your-host
DB_PORT=your-port
DB_USER=your-user
DB_PASSWORD=your-password
DB_NAME=ZipGrade
```

## Install Dependencies

If dependencies are not installed yet, run this from the project root:

```bash
npm install
```

## Run The Project

### Option 1: Run from each app folder

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

### Option 2: Run from the root

Backend:

```bash
npm run dev:backend
```

Frontend:

```bash
npm run dev:frontend
```

## Local URLs

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- API endpoint: `http://localhost:3001/api/omr-sheets`

The frontend Vite dev server proxies `/api` requests to the backend.

## Build Frontend

From the root:

```bash
npm run build
```

Or from the frontend folder:

```bash
cd frontend
npm run build
```

## Preview Frontend Build

From the root:

```bash
npm run preview
```

Or from the frontend folder:

```bash
cd frontend
npm run preview
```

## Backend Notes

- The backend server is in `backend/server.js`
- Database loading logic is in `backend/omrDb.js`
- The backend reads `.env` from:
  - `backend/.env`
  - or the project root `.env`
- The current listing logic uses a temporary constant user filter in `backend/omrDb.js`

## Frontend Notes

Important frontend files:

- `frontend/src/App.jsx`
- `frontend/src/api/omrSheetsApi.js`
- `frontend/src/components/AnswerKeySetup/`
- `frontend/src/components/BulkImportDialog/`
- `frontend/src/utils/validation.js`

## Database Schema

The latest schema file is stored at:

- `backend/database/schema.sql`

## Troubleshooting

### Port 3001 already in use

If backend startup fails with `EADDRINUSE`, another process is already using port `3001`.

Find the process:

```bash
lsof -i :3001
```

Kill it:

```bash
kill -9 <PID>
```

Or:

```bash
fuser -k 3001/tcp
```

### Backend starts but no quizzes appear

If `/api/omr-sheets` returns:

```json
{"omr_sheets":[]}
```

then the backend is working, but the current DB query returned no matching rows for the active filter.

### Database access errors

Check that:

- the root `.env` exists
- DB credentials are correct
- the database service is reachable
- the schema matches `backend/database/schema.sql`
