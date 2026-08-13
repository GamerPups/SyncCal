# CarFix — 3D Car Diagnostics

Enter your car details, view a realistic 3D model, look up OBD-II error codes with exact fix instructions, upload photos, and message your mechanic.

## Features

- **Car garage** — Add make, model, year, trim, VIN, mileage, engine, color, and body type
- **3D model viewer** — Interactive Three.js car that matches body type and paint color; affected parts glow red when diagnostic codes are active
- **OBD-II diagnostics** — Look up 25+ common error codes (P0300, P0420, P0171, etc.) with exact fix steps, parts needed, cost estimates, and difficulty
- **Photo uploads** — Drag-and-drop damage photos, dashboard codes, receipts
- **Messaging** — In-app chat thread per vehicle for notes or mechanic communication

## Quick Start

```bash
cd carfix
npm install
npm run dev:all    # API on :3002 + app on :5174
```

Open [http://localhost:5174](http://localhost:5174)

Or run separately:

```bash
npm run dev:server   # API on :3002
npm run dev          # Frontend on :5174
```

## Tech Stack

- React 19 + TypeScript + Vite
- Three.js + React Three Fiber + Drei (3D)
- Tailwind CSS
- Express + Multer (API, file uploads)
- JSON file storage (local dev)

## Project Structure

```
carfix/
├── server/           # Express API
│   ├── index.js      # Routes
│   └── storage.js    # File-based persistence
├── src/
│   ├── components/
│   │   ├── Car3DViewer.tsx
│   │   ├── DiagnosticPanel.tsx
│   │   ├── PhotoUpload.tsx
│   │   └── MessageThread.tsx
│   ├── lib/
│   │   └── diagnostics.ts   # OBD-II code database
│   └── pages/
```

## Usage

1. **Add a car** — Click "Add Car" and fill in your vehicle details
2. **Open dashboard** — See your car in 3D; rotate with mouse/touch
3. **Enter error code** — Type a code like `P0300` or search by symptom
4. **Review fix** — See exact steps, parts, and cost; save to your car
5. **Upload photos** — Document damage or dashboard readings
6. **Message** — Chat with yourself or share notes with a mechanic
