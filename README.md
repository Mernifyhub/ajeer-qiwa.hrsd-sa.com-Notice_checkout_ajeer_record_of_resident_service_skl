# Ajeer HR Solutions Permit — Next.js (Full-Stack)

Same design as the Ajeer permit page, rebuilt with **Next.js (App Router) + API backend**.
Permits are stored in `data/permits.json` and can be added / edited / deleted from the **/admin** page.
Each permit gets a **dynamic auto-generated ID** like `AJR-2026-0001`.

## Run locally

```bash
cd ajeer-nextjs       # this folder (keep it in your HOME directory, not a FAT32 pendrive!)
npm install
npm run dev
```

- Public permit page → http://localhost:3000
- Permit management (CRUD) → http://localhost:3000/admin
- Specific permit → http://localhost:3000/?id=AJR-2026-0001
- Printable notice (QR certificate) → http://localhost:3000/notice/AJR-2026-0001

> The QR code on the notice always points at the **current origin**
> (`<origin>/?id=<permitId>`) — localhost in dev, your real domain in production. No config needed.

> FAT32/exFAT pendrive? Use: `npm install --no-bin-links`
> then `node ./node_modules/next/dist/bin/next dev --hostname 0.0.0.0`

## API endpoints

| Method | Endpoint              | Description                    |
| ------ | --------------------- | ------------------------------ |
| GET    | `/api/permits`        | List all permits (newest first)|
| POST   | `/api/permits`        | Create (ID auto-generated)     |
| GET    | `/api/permits/:id`    | Get one permit                 |
| PUT    | `/api/permits/:id`    | Update (ID stays the same)     |
| DELETE | `/api/permits/:id`    | Delete                         |

### Example: create via curl

```bash
curl -X POST http://localhost:3000/api/permits \
  -H "Content-Type: application/json" \
  -d '{
    "employeeName": "محمد أحمد",
    "status": "Active",
    "startDate": "2026-08-01",
    "endDate": "2027-08-01",
    "beneficiary": { "name": "مؤسسة الاختبار", "number": "12-3456789" },
    "provider":    { "name": "شركة الموارد", "number": "7-7654321" }
  }'
```

## Notes

- Data persists in `data/permits.json` (git-ignored is optional — currently seeded with one permit).
- `npm run build && npm start` for production.
- On serverless hosts (e.g. Vercel) the filesystem is read-only — swap `lib/db.ts` for SQLite/Postgres there.
# Ajeer Permit Verification

Next.js application for permit verification with bilingual (Arabic/English) support.

## Getting Started

Install dependencies:

```bash
npm install