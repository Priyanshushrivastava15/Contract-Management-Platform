# Contract Management Platform

A full-stack system to manage reusable contract blueprints and track their lifecycle from creation to locking.

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Lucide Icons.
- **Backend:** Node.js, Express, MongoDB.
- **State Management:** React Hooks.
- **Deployment Ready:** Environment variable support for API linking.

## Key Features
- **Blueprint Engine:** Create templates with dynamic fields (Text, Date, Checkbox, Signature).
- **Lifecycle Guard:** Strict state machine enforcement (Created -> Approved -> Sent -> Signed -> Locked).
- **Data Snapshots:** Contracts capture a point-in-time snapshot of the blueprint fields.
- **Immutability:** Once Locked or Revoked, data cannot be modified.

## Setup
1. **Backend:** - `cd backend && npm install`
   - Create `.env` with `MONGO_URI`
   - `npm run dev`
2. **Frontend:**
   - `cd frontend && npm install`
   - `npm run dev`